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
import { GROUPES_INGREDIENTS, INDISPENSABLES } from '../../data/ingredients';
import { TypeRecette } from '../../models/recette';
import { SelectionRestes } from '../../services/selection-restes';
import { normaliser } from '../../utils/texte';

/** Durée maximale, attente comprise, pour le filtre « rapide ». */
const MINUTES_RAPIDE = 20;

@Component({
  selector: 'app-mes-restes',
  imports: [CarteRecette],
  templateUrl: './mes-restes.html',
  styleUrl: './mes-restes.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MesRestes {
  protected readonly selection = inject(SelectionRestes);
  protected readonly indispensables = INDISPENSABLES;

  protected readonly recherche = signal('');

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
