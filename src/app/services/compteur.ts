import { computed, effect, Injectable, signal } from '@angular/core';
import { GROUPES_INGREDIENTS } from '../data/ingredients';
import { RecetteGeneree } from '../models/recette';
import { ecrire, lire } from '../utils/stockage';

const CLE = 'rien-ne-se-jette.compteur';

/**
 * Valeur moyenne d'un reste sauvé, en euros : un demi-pain, deux bananes, un yaourt…
 * ou les produits qu'on n'a pas eu à acheter. Une estimation volontairement prudente.
 */
export const EUROS_PAR_RESTE = 0.5;

/** Paliers fêtés par un message : « 🎉 10 restes sauvés ! ». */
export const PALIERS = [5, 10, 25, 50, 100, 250, 500];

/** « 6 € », « 0,50 € ». */
export function enEuros(restes: number): string {
  const euros = restes * EUROS_PAR_RESTE;
  return Number.isInteger(euros) ? `${euros} €` : `${euros.toFixed(2).replace('.', ',')} €`;
}

/** Les produits du placard ne sont pas des restes sauvés. */
const PLACARD = new Set(
  GROUPES_INGREDIENTS.find((g) => g.titre === 'Dans mon placard')?.ingredients.map((i) => i.id),
);

export interface DonneesCompteur {
  restes: number;
  recettes: number;
  /** Nombre de fois où chaque recette a été cuisinée. */
  fois: Record<string, number>;
}

/** Compte les restes sauvés grâce aux recettes cuisinées, gardé dans le navigateur. */
@Injectable({ providedIn: 'root' })
export class Compteur {
  private readonly donnees = signal<DonneesCompteur>({
    restes: 0,
    recettes: 0,
    fois: {},
    ...lire<Partial<DonneesCompteur>>(CLE, {}),
  });

  /** Tout l'état, pour la sauvegarde dans le compte. */
  readonly etat = this.donnees.asReadonly();
  readonly restes = computed(() => this.donnees().restes);
  readonly recettes = computed(() => this.donnees().recettes);
  /** Estimation de l'argent économisé, déjà mise en forme. */
  readonly euros = computed(() => enEuros(this.restes()));

  constructor() {
    effect(() => ecrire(CLE, this.donnees()));
  }

  remplacer(donnees: DonneesCompteur): void {
    this.donnees.set(donnees);
  }

  fois(nom: string): number {
    return this.donnees().fois[nom] ?? 0;
  }

  cuisiner(recette: RecetteGeneree): void {
    this.ajouter(recette, 1);
  }

  /** Annule le dernier « je l'ai cuisinée » de cette recette. */
  annuler(recette: RecetteGeneree): void {
    if (this.fois(recette.nom) > 0) this.ajouter(recette, -1);
  }

  private ajouter(recette: RecetteGeneree, sens: 1 | -1): void {
    const restes = recette.ingredients.filter((i) => !PLACARD.has(i.id)).length;
    this.donnees.update((d) => ({
      restes: Math.max(0, d.restes + sens * restes),
      recettes: Math.max(0, d.recettes + sens),
      fois: { ...d.fois, [recette.nom]: Math.max(0, (d.fois[recette.nom] ?? 0) + sens) },
    }));
  }
}
