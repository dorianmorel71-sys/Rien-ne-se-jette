import { computed, effect, Injectable, signal } from '@angular/core';
import { GROUPES_INGREDIENTS } from '../data/ingredients';
import { RecetteGeneree } from '../models/recette';
import { ecrire, lire } from '../utils/stockage';

const CLE = 'rien-ne-se-jette.compteur';

/** Les produits du placard ne sont pas des restes sauvés. */
const PLACARD = new Set(
  GROUPES_INGREDIENTS.find((g) => g.titre === 'Dans mon placard')?.ingredients.map((i) => i.id),
);

interface DonneesCompteur {
  restes: number;
  recettes: number;
}

/** Compte les restes sauvés grâce aux recettes cuisinées, gardé dans le navigateur. */
@Injectable({ providedIn: 'root' })
export class Compteur {
  private readonly donnees = signal<DonneesCompteur>(
    lire<DonneesCompteur>(CLE, { restes: 0, recettes: 0 }),
  );
  /** Recettes cuisinées pendant cette visite, pour pouvoir annuler un clic. */
  private readonly cuisinees = signal<ReadonlySet<string>>(new Set());

  readonly restes = computed(() => this.donnees().restes);
  readonly recettes = computed(() => this.donnees().recettes);

  constructor() {
    effect(() => ecrire(CLE, this.donnees()));
  }

  estCuisinee(nom: string): boolean {
    return this.cuisinees().has(nom);
  }

  basculer(recette: RecetteGeneree): void {
    const restes = recette.ingredients.filter((i) => !PLACARD.has(i.id)).length;
    const annule = this.estCuisinee(recette.nom);
    const signe = annule ? -1 : 1;

    this.cuisinees.update((noms) => {
      const suivant = new Set(noms);
      if (annule) suivant.delete(recette.nom);
      else suivant.add(recette.nom);
      return suivant;
    });
    this.donnees.update((d) => ({
      restes: Math.max(0, d.restes + signe * restes),
      recettes: Math.max(0, d.recettes + signe),
    }));
  }
}
