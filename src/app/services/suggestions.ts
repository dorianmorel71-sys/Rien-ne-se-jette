import { GROUPE_PLACARD } from '../data/frigo';
import { GROUPES_INGREDIENTS } from '../data/ingredients';
import { MODELES_RECETTES } from '../data/recettes';
import { Ingredient, RecetteGeneree } from '../models/recette';
import { ResteAuFrigo } from './frigo';
import { genererRecette } from './generer-recette';

const INGREDIENTS = new Map<string, Ingredient>(
  GROUPES_INGREDIENTS.flatMap((g) => g.ingredients).map((i) => [i.id, i]),
);
const PLACARD = new Set(
  GROUPES_INGREDIENTS.find((g) => g.titre === GROUPE_PLACARD)?.ingredients.map((i) => i.id),
);

export interface Suggestion {
  recette: RecetteGeneree;
  /** Restes du frigo que la recette utilise, les plus urgents d'abord. */
  sauves: ResteAuFrigo[];
  /** Ce qu'il faut prendre dans le placard pour la faire. */
  placard: Ingredient[];
}

/** Plus un reste est près de sa date, plus le sauver compte. */
function poids(r: ResteAuFrigo): number {
  if (r.joursRestants <= 0) return 4;
  if (r.joursRestants === 1) return 3;
  if (r.joursRestants <= 3) return 2;
  return 1;
}

/**
 * Recettes qui sauvent le plus de restes du frigo, les urgents comptant davantage.
 * Seuls les produits du placard indispensables à la recette sont ajoutés.
 */
export function suggererRecettes(restes: readonly ResteAuFrigo[], nombre = 3): Suggestion[] {
  const auFrigo = new Map(restes.filter((r) => !r.congele && !r.libre).map((r) => [r.id, r]));
  if (!auFrigo.size) return [];

  return MODELES_RECETTES.flatMap((modele) => {
    const placard = modele.requis.filter((id) => PLACARD.has(id));
    const recette = genererRecette(modele, new Set([...auFrigo.keys(), ...placard]), INGREDIENTS);
    if (!recette) return [];
    const sauves = recette.ingredients
      .map((i) => auFrigo.get(i.id))
      .filter((r): r is ResteAuFrigo => !!r)
      .sort((a, b) => a.joursRestants - b.joursRestants);
    if (!sauves.length) return [];
    const score = sauves.reduce((total, r) => total + poids(r), 0) - placard.length * 0.5;
    return [{ recette, sauves, placard: placard.map((id) => INGREDIENTS.get(id)!), score }];
  })
    .sort((a, b) => b.score - a.score || a.recette.minutes - b.recette.minutes)
    .slice(0, nombre)
    .map(({ recette, sauves, placard }) => ({ recette, sauves, placard }));
}
