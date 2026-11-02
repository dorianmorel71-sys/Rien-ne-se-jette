/** Une partie d'un légume (fanes, épluchures, trognon…) et ses usages. */
export interface PartieLegume {
  nom: string;
  /** Usages possibles. Peut contenir du HTML simple (<b>) pour mettre en avant une idée. */
  usages: string[];
}

/** Famille sous laquelle le légume est rangé dans la liste. */
export type CategorieLegume =
  'Légumes' | 'Fruits' | 'Herbes & aromates' | 'Viande & poisson' | 'Épicerie & crèmerie';

export interface Legume {
  id: string;
  nom: string;
  /** Autres noms qu'on peut taper dans la recherche : « persil » pour les herbes fraîches. */
  synonymes?: string[];
  categorie: CategorieLegume;
  /** Sous-titre dans la famille (« Racines », « Agrumes & exotiques »), voir SOUS_FAMILLES. */
  sousFamille?: string;
  /** Illustration ; à défaut, on affiche l'initiale sur la couleur du légume. */
  emoji?: string;
  /** Ingrédients de « Mes restes » qui viennent de ce légume. */
  restes?: string[];
  /** Mois (1 à 12) où on le trouve produit en France ; absent s'il est importé. */
  saison?: number[];
  /** Ce qui ne se cuisine pas et part au compost. */
  compost?: string[];
  /** Comment garder les restes en attendant de les cuisiner. */
  conservation?: string[];
  /** Couleur de la pastille dans la liste. */
  couleur: string;
  score: string;
  intro: string;
  parties: PartieLegume[];
  avertissement?: string;
}
