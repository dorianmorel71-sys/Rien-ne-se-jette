import { computed, Injectable, signal } from '@angular/core';
import { GROUPES_RESTES, RECETTES, RESTES_EXEMPLE } from '../data/restes';
import { RecetteProposee, Reste } from '../models/recette';

/** Nombre de restes manquants affichés sous chaque recette. */
const MAX_MANQUANTS = 3;

/**
 * Garde les restes cochés pendant toute la session,
 * pour ne pas perdre la sélection quand on change d'onglet.
 */
@Injectable({ providedIn: 'root' })
export class SelectionRestes {
  private readonly restesParId = new Map<string, Reste>(
    GROUPES_RESTES.flatMap((g) => g.restes).map((r) => [r.id, r]),
  );

  private readonly choix = signal(new Set(RESTES_EXEMPLE));
  /** Vrai tant que l'utilisateur n'a pas touché à la sélection d'exemple. */
  readonly estExemple = signal(true);

  readonly nombre = computed(() => this.choix().size);

  readonly propositions = computed<RecetteProposee[]>(() => {
    const choix = this.choix();
    return RECETTES.map((recette) => {
      const utilises = recette.ingredients.filter((id) => choix.has(id));
      const manquants = recette.ingredients.filter((id) => !choix.has(id));
      return {
        recette,
        restesUtilises: utilises.map((id) => this.reste(id)),
        restesManquants: manquants.slice(0, MAX_MANQUANTS).map((id) => this.reste(id)),
      };
    })
      .filter((p) => p.restesUtilises.length > 0)
      .sort(
        (a, b) =>
          b.restesUtilises.length - a.restesUtilises.length ||
          b.restesUtilises.length / b.recette.ingredients.length -
            a.restesUtilises.length / a.recette.ingredients.length,
      );
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

  toutDecocher(): void {
    this.estExemple.set(false);
    this.choix.set(new Set());
  }

  private reste(id: string): Reste {
    return this.restesParId.get(id) ?? { id, nom: id };
  }
}
