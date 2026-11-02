import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { GROUPE_PLACARD } from '../data/frigo';
import { GROUPES_INGREDIENTS, INGREDIENTS_EXEMPLE } from '../data/ingredients';
import { INGREDIENTS_MASQUES } from '../data/visibles';
import { MODELES_RECETTES } from '../data/recettes';
import { Ingredient, RecetteGeneree } from '../models/recette';
import { ecrire, lire } from '../utils/stockage';
import { poidsUrgence } from '../utils/urgence';
import { Frigo } from './frigo';
import { genererRecette } from './generer-recette';

const CLE_PLACARD = 'rien-ne-se-jette.placard';
const CLE_PLACARD_DEMANDE = 'rien-ne-se-jette.placard-demande';

export const PLACARD = new Set(
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
  private readonly choix = computed(
    () =>
      new Set([...this.restes(), ...this.placard()].filter((id) => !INGREDIENTS_MASQUES.has(id))),
  );

  /**
   * Faut-il demander ce qu'il y a toujours au placard ? Une seule fois, et pas si
   * le placard a déjà été coché.
   */
  readonly placardADemander = signal(
    !lire(CLE_PLACARD_DEMANDE, false) && this.placard().size === 0,
  );

  placardDemande(): void {
    this.placardADemander.set(false);
    ecrire(CLE_PLACARD_DEMANDE, true);
  }

  /** Restes cochés à la main, hors placard (l'exemple ne compte pas). */
  readonly restesCoches = computed(() =>
    this.estExemple() ? [] : [...this.restes()].filter((id) => !INGREDIENTS_MASQUES.has(id)),
  );

  /** Demande à la page « Recettes » de défiler jusqu'aux recettes à son ouverture. */
  readonly defilerVersRecettes = signal(false);

  readonly nombre = computed(() => this.choix().size);

  /**
   * Recettes réalisables avec uniquement ce qui est coché. D'abord celles qui sauvent
   * les restes du frigo les plus urgents, puis celles qui utilisent le plus d'ingrédients.
   */
  readonly recettes = computed<RecetteGeneree[]>(() => {
    const choix = this.choix();
    const urgence = new Map(
      this.frigo.auFrigo().map((r) => [r.id, poidsUrgence(r.joursRestants)] as const),
    );
    const score = (r: RecetteGeneree) =>
      r.ingredients.reduce((total, i) => total + (urgence.get(i.id) ?? 0), 0);
    return MODELES_RECETTES.map((m) => genererRecette(m, choix, this.ingredientsParId))
      .filter((r): r is RecetteGeneree => r !== null)
      .sort(
        (a, b) =>
          score(b) - score(a) ||
          b.ingredients.length - a.ingredients.length ||
          a.minutes - b.minutes,
      );
  });

  /**
   * Produits du placard qui débloqueraient d'autres recettes avec les restes cochés :
   * « Avec des œufs en plus : Pain perdu salé ». Les plus utiles d'abord.
   */
  readonly aUnPres = computed<{ ingredient: Ingredient; recettes: string[] }[]>(() => {
    const choix = this.choix();
    if (![...choix].some((id) => !PLACARD.has(id))) return [];
    const possibles = new Set(this.recettes().map((r) => r.nom));
    const parProduit = new Map<string, string[]>();
    for (const modele of MODELES_RECETTES) {
      if (possibles.has(modele.nom)) continue;
      for (const id of [...modele.requis, ...modele.restes]) {
        if (!PLACARD.has(id) || choix.has(id) || INGREDIENTS_MASQUES.has(id)) continue;
        const recette = genererRecette(modele, new Set([...choix, id]), this.ingredientsParId);
        // Seulement les recettes qui sauvent au moins un des restes cochés.
        if (!recette?.ingredients.some((i) => choix.has(i.id) && !PLACARD.has(i.id))) continue;
        parProduit.set(id, [...(parProduit.get(id) ?? []), modele.nom]);
        break;
      }
    }
    return [...parProduit]
      .map(([id, recettes]) => ({ ingredient: this.ingredientsParId.get(id)!, recettes }))
      .sort((a, b) => b.recettes.length - a.recettes.length)
      .slice(0, 4);
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

  /** Coche ou décoche un reste en repartant de zéro si l'exemple était affiché. */
  basculerSansExemple(id: string): void {
    if (this.estExemple() && !PLACARD.has(id)) this.restesManuels.set(new Set());
    this.basculer(id);
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
