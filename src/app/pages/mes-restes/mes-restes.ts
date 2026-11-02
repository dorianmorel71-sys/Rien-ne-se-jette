import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { CarteRecette } from '../../components/carte-recette/carte-recette';
import { TitrePage } from '../../components/titre-page/titre-page';
import { INDISPENSABLES } from '../../data/ingredients';
import { GROUPES_INGREDIENTS_VISIBLES as GROUPES, LEGUMES_VISIBLES } from '../../data/visibles';
import { Ingredient, TypeRecette } from '../../models/recette';
import { FONCTIONNALITES } from '../../../environments/fonctionnalites';
import { Frigo, RESTES_FRIGO } from '../../services/frigo';
import { Favoris } from '../../services/favoris';
import { Messages } from '../../services/messages';
import { libelleDelai, niveauDelai } from '../../utils/urgence';
import { SelectionRestes } from '../../services/selection-restes';
import { PAGES } from '../../pages-noms';
import { enSousGroupes } from '../../utils/sous-familles';
import { normaliser } from '../../utils/texte';

/**
 * Emoji (ou à défaut couleur) et sous-famille de l'aliment d'où vient chaque reste,
 * les mêmes que dans le Guide anti-gaspi.
 */
const EMOJI_PAR_RESTE = new Map<string, string>();
const COULEUR_PAR_RESTE = new Map<string, string>();
const SOUS_FAMILLE_PAR_RESTE = new Map<string, string>();
for (const l of LEGUMES_VISIBLES) {
  for (const id of l.restes ?? []) {
    if (l.emoji && !EMOJI_PAR_RESTE.has(id)) EMOJI_PAR_RESTE.set(id, l.emoji);
    if (!COULEUR_PAR_RESTE.has(id)) COULEUR_PAR_RESTE.set(id, l.couleur);
    if (l.sousFamille && !SOUS_FAMILLE_PAR_RESTE.has(id))
      SOUS_FAMILLE_PAR_RESTE.set(id, l.sousFamille);
  }
}

/** Restes de légumes qui ne viennent d'aucun légume précis (« Légumes cuits »). */
const LEGUMES_VARIES = 'Légumes variés';

/** Durée maximale, attente comprise, pour le filtre « rapide ». */
const MINUTES_RAPIDE = 20;

@Component({
  selector: 'app-mes-restes',
  imports: [CarteRecette, TitrePage],
  templateUrl: './mes-restes.html',
  styleUrl: './mes-restes.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MesRestes {
  protected readonly selection = inject(SelectionRestes);
  protected readonly page = PAGES.recettes;
  protected readonly favoris = inject(Favoris);
  /** Restes du frigo, pour afficher le temps qu'il leur reste à côté de leur nom. */
  protected readonly auFrigo = computed(
    () => new Map(this.frigo.auFrigo().map((r) => [r.id, r] as const)),
  );
  protected readonly delai = libelleDelai;
  protected readonly niveau = niveauDelai;
  private readonly messages = inject(Messages);
  protected readonly indispensables = INDISPENSABLES;
  protected readonly emoji = EMOJI_PAR_RESTE;
  protected readonly couleur = COULEUR_PAR_RESTE;
  /** Sans viande ni poisson dans cette version, toutes les recettes sont végétariennes. */
  protected readonly avecViande = FONCTIONNALITES.viandePoisson;

  private readonly frigo = inject(Frigo);

  protected readonly recherche = signal('');

  /** Familles dépliées : toutes repliées au départ, le nombre de cochés reste visible. */
  protected readonly ouvertes = signal<ReadonlySet<string>>(new Set());
  protected readonly toutOuvrir = computed(() => !!this.recherche().trim());

  protected replier(famille: string, ouverte: boolean): void {
    if (this.toutOuvrir()) return;
    this.ouvertes.update((o) => {
      const suivant = new Set(o);
      if (ouverte) suivant.add(famille);
      else suivant.delete(famille);
      return suivant;
    });
  }

  protected nombreCoches(ingredients: Ingredient[]): number {
    return ingredients.filter((i) => this.selection.estCoche(i.id)).length;
  }

  /** Restes cochés (hors placard) qui ne sont pas encore au frigo. */
  protected readonly aRanger = computed(() =>
    !FONCTIONNALITES.frigo || this.selection.estExemple()
      ? []
      : RESTES_FRIGO.filter((i) => this.selection.estCoche(i.id) && !this.frigo.contient(i.id)),
  );
  protected mettreAuFrigo(): void {
    const ids = this.aRanger().map((i) => i.id);
    this.frigo.ranger(ids);
    this.messages.afficher(
      `🧊 ${ids.length > 1 ? `${ids.length} restes mis` : 'Mis'} au frigo`,
      () => this.frigo.retirer(ids),
    );
  }

  /**
   * « Ce que j'ai » est déplié sur ordinateur (il y a la place à côté des recettes),
   * et sur téléphone seulement quand il faut d'abord cocher quelque chose.
   */
  protected readonly ajusterOuvert = signal(
    !!globalThis.matchMedia?.('(min-width: 1000px)').matches ||
      this.selection.estExemple() ||
      this.selection.nombre() === 0,
  );

  /** Groupes réduits aux ingrédients qui correspondent à la recherche, rangés sous leurs sous-titres. */
  protected readonly groupes = computed(() => {
    const filtre = normaliser(this.recherche().trim());
    return GROUPES.map((g) => ({
      ...g,
      ingredients: g.ingredients.filter((i) => !filtre || normaliser(i.nom).includes(filtre)),
    }))
      .filter((g) => g.ingredients.length > 0)
      .map((g) => ({
        ...g,
        sousGroupes: enSousGroupes(
          g.titre,
          g.ingredients,
          (i) => SOUS_FAMILLE_PAR_RESTE.get(i.id),
          LEGUMES_VARIES,
        ),
      }));
  });

  protected readonly types: { valeur: TypeRecette | null; libelle: string }[] = [
    { valeur: null, libelle: 'Tout' },
    { valeur: 'salé', libelle: 'Salé' },
    { valeur: 'sucré', libelle: 'Sucré' },
    { valeur: 'boisson', libelle: 'Boissons' },
  ];
  protected readonly type = signal<TypeRecette | null>(null);
  protected readonly rapide = signal(false);
  protected readonly sansFour = signal(false);
  protected readonly vegetarien = signal(false);

  protected readonly recettesFiltrees = computed(() =>
    this.selection
      .recettes()
      .filter(
        (r) =>
          (!this.type() || r.type === this.type()) &&
          (!this.rapide() || r.minutes <= MINUTES_RAPIDE) &&
          (!this.sansFour() || !r.four) &&
          (!this.vegetarien() || r.vegetarien),
      ),
  );

  private readonly recettes = viewChild.required<ElementRef<HTMLElement>>('recettes');

  /** Bouton « Voir les recettes » : replie « Ce que j'ai » et descend jusqu'aux recettes. */
  protected voirRecettes(): void {
    this.ajusterOuvert.set(false);
    setTimeout(() =>
      this.recettes().nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    );
  }

  constructor() {
    // Arrivée depuis une fiche légume : on montre directement les recettes.
    afterNextRender(() => {
      if (!this.selection.defilerVersRecettes()) return;
      this.selection.defilerVersRecettes.set(false);
      this.recettes().nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}
