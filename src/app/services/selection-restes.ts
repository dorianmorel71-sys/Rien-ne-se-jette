import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { GROUPE_PLACARD } from '../data/frigo';
import { GROUPES_INGREDIENTS, INGREDIENTS_EXEMPLE } from '../data/ingredients';
import { MODELES_RECETTES } from '../data/recettes';
import { Ingredient, RecetteGeneree } from '../models/recette';
import { ecrire, lire } from '../utils/stockage';
import { Frigo } from './frigo';
import { genererRecette } from './generer-recette';

const CLE_PLACARD = 'rien-ne-se-jette.placard';

const PLACARD = new Set(
  GROUPES_INGREDIENTS.find((g) => g.titre === GROUPE_PLACARD)?.ingredients.map((i) => i.id),
);

/** D'où viennent les restes cochés. */
export type OrigineSelection = 'exemple' | 'frigo' | 'manuel';

/**
 * Ce que l'on a sous la main pour cuisiner. Tant qu'on n'y touche pas, les restes
 * cochés sont ceux du frigo ; le placard coché est retenu d'une visite à l'autre.
 */
@Injectable({ providedIn: 'root' })
export class SelectionRestes {
  private readonly frigo = inject(Frigo);
  private readonly ingredientsParId = new Map<string, Ingredient>(
    GROUPES_INGREDIENTS.flatMap((g) => g.ingredients).map((i) => [i.id, i]),
  );

  /** Produits du placard cochés : ils changent peu, on les garde sur l'appareil. */
  private readonly placard = signal<ReadonlySet<string>>(new Set(lire<string[]>(CLE_PLACARD, [])));
  /** Restes cochés à la main ; null tant qu'on n'y a pas touché (on suit alors le frigo). */
  private readonly restesManuels = signal<ReadonlySet<string> | null>(null);
  /** Restes du frigo pour lesquels il existe des recettes (ni congelés, ni écrits à la main). */
  private readonly restesDuFrigo = computed(() =>
    this.frigo
      .auFrigo()
      .filter((r) => !r.libre)
      .map((r) => r.id),
  );

  readonly origine = computed<OrigineSelection>(() => {
    if (this.restesManuels()) return 'manuel';
    return this.restesDuFrigo().length ? 'frigo' : 'exemple';
  });
  /** Vrai tant que l'utilisateur n'a rien coché et que son frigo est vide. */
  readonly estExemple = computed(() => this.origine() === 'exemple');
  /** Le frigo contient des restes avec lesquels repartir. */
  readonly frigoDisponible = computed(() => this.restesDuFrigo().length > 0);

  private readonly restes = computed<ReadonlySet<string>>(() => {
    const manuels = this.restesManuels();
    if (manuels) return manuels;
    return new Set(this.origine() === 'frigo' ? this.restesDuFrigo() : INGREDIENTS_EXEMPLE);
  });
  private readonly choix = computed(() => new Set([...this.restes(), ...this.placard()]));

  /** Demande à la page « Recettes » de défiler jusqu'aux recettes à son ouverture. */
  readonly defilerVersRecettes = signal(false);

  readonly nombre = computed(() => this.choix().size);

  /** Recettes réalisables avec uniquement ce qui est coché, celles qui en utilisent le plus d'abord. */
  readonly recettes = computed<RecetteGeneree[]>(() => {
    const choix = this.choix();
    return MODELES_RECETTES.map((m) => genererRecette(m, choix, this.ingredientsParId))
      .filter((r): r is RecetteGeneree => r !== null)
      .sort((a, b) => b.ingredients.length - a.ingredients.length);
  });

  constructor() {
    effect(() => ecrire(CLE_PLACARD, [...this.placard()]));
  }

  estCoche(id: string): boolean {
    return this.choix().has(id);
  }

  basculer(id: string): void {
    if (PLACARD.has(id)) {
      this.placard.update((p) => basculerDans(p, id));
    } else {
      this.restesManuels.set(basculerDans(this.restes(), id));
    }
  }

  /** Coche ces restes en plus de la sélection (ils remplacent l'exemple s'il est encore là). */
  ajouter(ids: readonly string[]): void {
    const depart = this.estExemple() ? [] : this.restes();
    this.restesManuels.set(new Set([...depart, ...ids.filter((id) => !PLACARD.has(id))]));
    this.placard.update((p) => new Set([...p, ...ids.filter((id) => PLACARD.has(id))]));
  }

  toutDecocher(): void {
    this.restesManuels.set(new Set());
    this.placard.set(new Set());
  }

  /** Oublie ce qui a été coché à la main et repart du contenu du frigo. */
  repartirDuFrigo(): void {
    this.restesManuels.set(null);
  }
}

function basculerDans(ensemble: ReadonlySet<string>, id: string): Set<string> {
  const suivant = new Set(ensemble);
  if (!suivant.delete(id)) suivant.add(id);
  return suivant;
}
