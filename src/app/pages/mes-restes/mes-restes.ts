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
import { RouterLink } from '@angular/router';
import { CarteRecette } from '../../components/carte-recette/carte-recette';
import { GROUPES_INGREDIENTS, INDISPENSABLES } from '../../data/ingredients';
import { Ingredient, TypeRecette } from '../../models/recette';
import { Frigo, RESTES_FRIGO } from '../../services/frigo';
import { SelectionRestes } from '../../services/selection-restes';
import { normaliser } from '../../utils/texte';

/** Durée maximale, attente comprise, pour le filtre « rapide ». */
const MINUTES_RAPIDE = 20;

@Component({
  selector: 'app-mes-restes',
  imports: [CarteRecette, RouterLink],
  templateUrl: './mes-restes.html',
  styleUrl: './mes-restes.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MesRestes {
  protected readonly selection = inject(SelectionRestes);
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
  /** Vrai juste après avoir rangé, pour proposer d'aller voir le frigo. */
  protected readonly rangesAuFrigo = signal(false);

  protected mettreAuFrigo(): void {
    this.frigo.ranger(this.aRanger().map((i) => i.id));
    this.rangesAuFrigo.set(true);
  }

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
