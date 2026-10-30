import { computed, effect, Injectable, signal } from '@angular/core';
import { GROUPE_PLACARD, JOURS_CONGELATEUR, JOURS_DECONGELE, joursAuFrigo } from '../data/frigo';
import { GROUPES_INGREDIENTS } from '../data/ingredients';
import { LEGUMES } from '../data/legumes';
import { Ingredient } from '../models/recette';
import { ajouterJours, aujourdhui, ecartEnJours } from '../utils/date';
import { ecrire, lire } from '../utils/stockage';

const CLE = 'rien-ne-se-jette.frigo';

/** Préfixe des restes écrits à la main, qui ne sont pas dans la liste. */
const PREFIXE_LIBRE = 'libre-';

/** Un reste mis de côté et le jour où il y est entré. */
export interface Rangement {
  id: string;
  /** « 2026-10-30 » : jour où il a été rangé, ou congelé, ou sorti du congélateur. */
  depuis: string;
  /** Nom d'un reste écrit à la main. */
  nom?: string;
  /** Quantité ou rappel (« la moitié », « pour dimanche »). */
  note?: string;
  congele?: boolean;
  /** Sorti du congélateur : il se mange vite. */
  decongele?: boolean;
}

export interface ResteAuFrigo {
  id: string;
  ingredient: Ingredient;
  depuis: string;
  note?: string;
  congele: boolean;
  decongele: boolean;
  /** Écrit à la main : pas de recette associée. */
  libre: boolean;
  /** Jour jusqu'auquel il se garde. */
  limite: string;
  /** 0 : à finir aujourd'hui ; négatif : la date est passée. */
  joursRestants: number;
  /** Conseils de conservation de la fiche du légume d'où vient ce reste. */
  conseils: string[];
}

/** Où et quand ranger un reste. */
export interface OptionsRangement {
  depuis?: string;
  congele?: boolean;
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

function duree(r: Rangement): number {
  if (r.congele) return JOURS_CONGELATEUR;
  if (r.decongele) return JOURS_DECONGELE;
  return joursAuFrigo(r.id);
}

function ingredient(r: Rangement): Ingredient | undefined {
  if (r.id.startsWith(PREFIXE_LIBRE)) {
    return r.nom ? { id: r.id, nom: r.nom, avecArticle: r.nom } : undefined;
  }
  return RESTES_PAR_ID.get(r.id);
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
      .flatMap((r) => {
        const i = ingredient(r);
        if (!i) return [];
        const limite = ajouterJours(r.depuis, duree(r));
        return [
          {
            id: r.id,
            ingredient: i,
            depuis: r.depuis,
            note: r.note,
            congele: !!r.congele,
            decongele: !!r.decongele,
            libre: r.id.startsWith(PREFIXE_LIBRE),
            limite,
            joursRestants: ecartEnJours(this.jour(), limite),
            conseils: CONSEILS_PAR_RESTE.get(r.id) ?? [],
          },
        ];
      })
      .sort((a, b) => a.joursRestants - b.joursRestants),
  );

  readonly auFrigo = computed(() => this.restes().filter((r) => !r.congele));
  readonly auCongelateur = computed(() => this.restes().filter((r) => r.congele));

  readonly nombre = computed(() => this.restes().length);
  /** Au frigo, à finir aujourd'hui ou demain, ou déjà dépassés. */
  readonly urgents = computed(() => this.auFrigo().filter((r) => r.joursRestants <= 1).length);

  constructor() {
    effect(() => ecrire(CLE, this.rangements()));
  }

  contient(id: string): boolean {
    return this.rangements().some((r) => r.id === id);
  }

  /** Range ces restes (aujourd'hui par défaut) ; ceux qui y sont déjà ne bougent pas. */
  ranger(ids: readonly string[], options: OptionsRangement = {}): void {
    const nouveaux = [...new Set(ids)].filter((id) => RESTES_PAR_ID.has(id) && !this.contient(id));
    if (!nouveaux.length) return;
    this.rangements.update((r) => [...r, ...nouveaux.map((id) => this.nouveau(id, options))]);
  }

  /** Range un reste qui n'est pas dans la liste, écrit à la main. */
  rangerLibre(nom: string, options: OptionsRangement = {}): void {
    const id = `${PREFIXE_LIBRE}${Date.now().toString(36)}`;
    this.rangements.update((r) => [...r, { ...this.nouveau(id, options), nom: nom.trim() }]);
  }

  /** Change la date de rangement ou la note. */
  modifier(id: string, changements: Partial<Pick<Rangement, 'depuis' | 'note'>>): void {
    this.mettreAJour(id, changements);
  }

  /** La date repart du jour où il entre au congélateur. */
  congeler(id: string): void {
    this.mettreAJour(id, { depuis: this.jour(), congele: true, decongele: false });
  }

  /** Sorti du congélateur, il se garde 24 h au frigo. */
  decongeler(id: string): void {
    this.mettreAJour(id, { depuis: this.jour(), congele: false, decongele: true });
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

  private nouveau(id: string, { depuis, congele }: OptionsRangement): Rangement {
    return { id, depuis: depuis ?? this.jour(), ...(congele ? { congele: true } : {}) };
  }

  private mettreAJour(id: string, changements: Partial<Rangement>): void {
    this.rangements.update((liste) =>
      liste.map((r) => (r.id === id ? { ...r, ...changements } : r)),
    );
  }
}
