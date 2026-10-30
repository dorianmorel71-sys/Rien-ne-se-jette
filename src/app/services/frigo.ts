import { computed, effect, Injectable, signal } from '@angular/core';
import { GROUPE_PLACARD, joursAuFrigo } from '../data/frigo';
import { GROUPES_INGREDIENTS } from '../data/ingredients';
import { LEGUMES } from '../data/legumes';
import { Ingredient } from '../models/recette';
import { ajouterJours, aujourdhui, ecartEnJours } from '../utils/date';
import { ecrire, lire } from '../utils/stockage';

const CLE = 'rien-ne-se-jette.frigo';

/** Un reste mis au frigo et le jour où il y est entré. */
export interface Rangement {
  id: string;
  /** « 2026-10-30 » */
  depuis: string;
}

export interface ResteAuFrigo {
  ingredient: Ingredient;
  depuis: string;
  /** Jour jusqu'auquel il se garde. */
  limite: string;
  /** 0 : à finir aujourd'hui ; négatif : la date est passée. */
  joursRestants: number;
  /** Conseils de conservation de la fiche du légume d'où vient ce reste. */
  conseils: string[];
}

/** Restes qu'on peut mettre au frigo : tout sauf le placard. */
export const RESTES_FRIGO: Ingredient[] = GROUPES_INGREDIENTS.filter(
  (g) => g.titre !== GROUPE_PLACARD,
).flatMap((g) => g.ingredients);

const RESTES_PAR_ID = new Map(RESTES_FRIGO.map((i) => [i.id, i]));

const CONSEILS_PAR_RESTE = new Map<string, string[]>();
for (const legume of LEGUMES) {
  for (const id of legume.restes ?? []) {
    CONSEILS_PAR_RESTE.set(id, [
      ...(CONSEILS_PAR_RESTE.get(id) ?? []),
      ...(legume.conservation ?? []),
    ]);
  }
}

/** Les restes mis de côté avec leur date limite, gardés dans le navigateur. */
@Injectable({ providedIn: 'root' })
export class Frigo {
  private readonly rangements = signal<Rangement[]>(lire<Rangement[]>(CLE, []));
  /** Jour de référence, remis à jour quand on revient sur l'appli. */
  readonly jour = signal(aujourdhui());

  /** Tout l'état, pour la sauvegarde dans le compte. */
  readonly etat = this.rangements.asReadonly();

  /** Les plus urgents d'abord. */
  readonly restes = computed<ResteAuFrigo[]>(() =>
    this.rangements()
      .filter((r) => RESTES_PAR_ID.has(r.id))
      .map((r) => {
        const limite = ajouterJours(r.depuis, joursAuFrigo(r.id));
        return {
          ingredient: RESTES_PAR_ID.get(r.id)!,
          depuis: r.depuis,
          limite,
          joursRestants: ecartEnJours(this.jour(), limite),
          conseils: CONSEILS_PAR_RESTE.get(r.id) ?? [],
        };
      })
      .sort((a, b) => a.joursRestants - b.joursRestants),
  );

  readonly nombre = computed(() => this.restes().length);
  /** À finir aujourd'hui ou demain, ou déjà dépassés. */
  readonly urgents = computed(() => this.restes().filter((r) => r.joursRestants <= 1).length);

  constructor() {
    effect(() => ecrire(CLE, this.rangements()));
  }

  contient(id: string): boolean {
    return this.rangements().some((r) => r.id === id);
  }

  /** Range ces restes à la date du jour ; ceux qui y sont déjà gardent leur date. */
  ranger(ids: readonly string[]): void {
    const nouveaux = [...new Set(ids)].filter((id) => RESTES_PAR_ID.has(id) && !this.contient(id));
    if (!nouveaux.length) return;
    this.rangements.update((r) => [...r, ...nouveaux.map((id) => ({ id, depuis: this.jour() }))]);
  }

  retirer(ids: readonly string[]): void {
    this.rangements.update((r) => r.filter((x) => !ids.includes(x.id)));
  }

  remplacer(rangements: Rangement[]): void {
    this.rangements.set(rangements);
  }

  vider(): void {
    this.rangements.set([]);
  }
}
