export interface Reste {
  id: string;
  nom: string;
}

export interface GroupeRestes {
  titre: string;
  restes: Reste[];
}

export interface Recette {
  nom: string;
  temps: string;
  /** Identifiants des restes utilisables dans la recette. */
  ingredients: string[];
  /** Ingrédients de base à avoir en plus des restes. */
  base: string;
  etapes: string[];
  avertissement?: string;
}

/** Une recette proposée, avec les restes cochés qu'elle utilise et ceux qui manquent. */
export interface RecetteProposee {
  recette: Recette;
  restesUtilises: Reste[];
  restesManquants: Reste[];
}
