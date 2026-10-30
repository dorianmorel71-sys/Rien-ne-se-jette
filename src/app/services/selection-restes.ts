import { computed, Injectable, signal } from '@angular/core';
import { GROUPES_INGREDIENTS, INGREDIENTS_EXEMPLE } from '../data/ingredients';
import { MODELES_RECETTES } from '../data/recettes';
import { Ingredient, RecetteGeneree } from '../models/recette';
import { genererRecette } from './generer-recette';

/**
 * Garde les ingrédients cochés pendant toute la session,
 * pour ne pas perdre la sélection quand on change d'onglet.
 */
@Injectable({ providedIn: 'root' })
export class SelectionRestes {
  private readonly ingredientsParId = new Map<string, Ingredient>(
    GROUPES_INGREDIENTS.flatMap((g) => g.ingredients).map((i) => [i.id, i]),
  );

  private readonly choix = signal<ReadonlySet<string>>(new Set(INGREDIENTS_EXEMPLE));
  /** Vrai tant que l'utilisateur n'a pas touché à la sélection d'exemple. */
  readonly estExemple = signal(true);
  /** Demande à la page « Mes restes » de défiler jusqu'aux recettes à son ouverture. */
  readonly defilerVersRecettes = signal(false);

  readonly nombre = computed(() => this.choix().size);

  /** Recettes réalisables avec uniquement ce qui est coché, celles qui en utilisent le plus d'abord. */
  readonly recettes = computed<RecetteGeneree[]>(() => {
    const choix = this.choix();
    return MODELES_RECETTES.map((m) => genererRecette(m, choix, this.ingredientsParId))
      .filter((r): r is RecetteGeneree => r !== null)
      .sort((a, b) => b.ingredients.length - a.ingredients.length);
  });

  estCoche(id: string): boolean {
    return this.choix().has(id);
  }

  basculer(id: string): void {
    this.estExemple.set(false);
    this.choix.update((choix) => {
      const suivant = new Set(choix);
      if (!suivant.delete(id)) suivant.add(id);
      return suivant;
    });
  }

  /** Coche ces restes en plus de la sélection (qui remplacent l'exemple s'il est encore là). */
  ajouter(ids: readonly string[]): void {
    this.choix.update((choix) => new Set([...(this.estExemple() ? [] : choix), ...ids]));
    this.estExemple.set(false);
  }

  toutDecocher(): void {
    this.estExemple.set(false);
    this.choix.set(new Set());
  }
}
