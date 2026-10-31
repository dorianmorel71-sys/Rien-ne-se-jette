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
import { GROUPES_INGREDIENTS, INDISPENSABLES } from '../../data/ingredients';
import { Ingredient, TypeRecette } from '../../models/recette';
import { Frigo, RESTES_FRIGO } from '../../services/frigo';
import { Messages } from '../../services/messages';
import { SelectionRestes } from '../../services/selection-restes';
import { PAGES } from '../../pages-noms';
import { normaliser } from '../../utils/texte';

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
  private readonly messages = inject(Messages);
  protected readonly indispensables = INDISPENSABLES;

  private readonly frigo = inject(Frigo);

  protected readonly recherche = signal('');

  /** Familles dépliées ; au départ, celles où quelque chose est coché. */
  protected readonly ouvertes = signal<ReadonlySet<string>>(
    new Set(
      GROUPES_INGREDIENTS.filter((g) =>
        g.ingredients.some((i) => this.selection.estCoche(i.id)),
      ).map((g) => g.titre),
    ),
  );
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
    this.selection.estExemple()
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

  /** Groupes réduits aux ingrédients qui correspondent à la recherche. */
  protected readonly groupes = computed(() => {
    const filtre = normaliser(this.recherche().trim());
    if (!filtre) return GROUPES_INGREDIENTS;
    return GROUPES_INGREDIENTS.map((g) => ({
      ...g,
      ingredients: g.ingredients.filter((i) => normaliser(i.nom).includes(filtre)),
    })).filter((g) => g.ingredients.length > 0);
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

  constructor() {
    // Arrivée depuis une fiche légume : on montre directement les recettes.
    afterNextRender(() => {
      if (!this.selection.defilerVersRecettes()) return;
      this.selection.defilerVersRecettes.set(false);
      this.recettes().nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}
