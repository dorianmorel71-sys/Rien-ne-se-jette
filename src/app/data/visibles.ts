import { FONCTIONNALITES } from '../../environments/fonctionnalites';
import { CategorieLegume } from '../models/legume';
import { GROUPES_INGREDIENTS } from './ingredients';
import { CATEGORIES_LEGUMES, LEGUMES } from './legumes';

/**
 * Aliments et restes montrés dans cette version. Les familles pas encore ouvertes
 * aux testeurs (voir `fonctionnalites.ts`) restent dans les données, mais ne s'affichent pas.
 */
const FAMILLES_MASQUEES: CategorieLegume[] = FONCTIONNALITES.viandePoisson
  ? []
  : ['Viande & poisson'];

/** Produits du placard qui appartiennent à une famille masquée. */
const PLACARD_MASQUE = FONCTIONNALITES.viandePoisson ? [] : ['thon-boite', 'sardines-boite'];

export const CATEGORIES_VISIBLES = CATEGORIES_LEGUMES.filter((c) => !FAMILLES_MASQUEES.includes(c));

export const LEGUMES_VISIBLES = LEGUMES.filter((l) => !FAMILLES_MASQUEES.includes(l.categorie));

export const GROUPES_INGREDIENTS_VISIBLES = GROUPES_INGREDIENTS.filter(
  (g) => !(FAMILLES_MASQUEES as string[]).includes(g.titre),
).map((g) => ({ ...g, ingredients: g.ingredients.filter((i) => !PLACARD_MASQUE.includes(i.id)) }));

/** Restes qu'on ne peut pas cocher dans cette version : ignorés s'ils l'avaient été avant. */
export const INGREDIENTS_MASQUES: ReadonlySet<string> = new Set([
  ...GROUPES_INGREDIENTS.filter((g) => (FAMILLES_MASQUEES as string[]).includes(g.titre)).flatMap(
    (g) => g.ingredients.map((i) => i.id),
  ),
  ...PLACARD_MASQUE,
]);
