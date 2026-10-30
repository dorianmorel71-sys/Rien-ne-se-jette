/** Un reste ou un produit du placard que l'on peut cocher. */
export interface Ingredient {
  id: string;
  nom: string;
  /** Nom avec son article (« le vert de poireau »), pour l'insérer dans les étapes. */
  avecArticle: string;
}

export interface GroupeIngredients {
  titre: string;
  ingredients: Ingredient[];
}

/**
 * Étape d'un modèle de recette. Une chaîne simple s'affiche toujours.
 * `si` : affichée seulement si cet ingrédient est coché ; `sauf` : seulement s'il ne l'est pas.
 * Le texte peut contenir `{restes}`, remplacé par les restes cochés ; l'étape est
 * alors masquée quand aucun n'est coché.
 */
export type Etape = string | { texte: string; si?: string; sauf?: string };

/** Modèle à partir duquel on génère une recette avec uniquement ce qui est coché. */
/** Salé par défaut. */
export type TypeRecette = 'salé' | 'sucré' | 'boisson';

export interface ModeleRecette {
  nom: string;
  emoji: string;
  temps: string;
  /** À préciser seulement pour le sucré et les boissons. */
  type?: Exclude<TypeRecette, 'salé'>;
  /** Tous doivent être cochés pour proposer la recette. */
  requis: string[];
  /** Restes interchangeables, insérés à la place de `{restes}` dans les étapes. */
  restes: string[];
  /** Nombre minimum de `restes` cochés (1 par défaut). */
  minRestes?: number;
  /** Utilisés seulement s'ils sont cochés. */
  optionnels: string[];
  etapes: Etape[];
  avertissement?: { texte: string; si?: string };
}

/** Recette générée : uniquement les ingrédients cochés et les étapes qui les concernent. */
export interface RecetteGeneree {
  nom: string;
  emoji?: string;
  temps: string;
  type: TypeRecette;
  /** Durée totale, attente comprise. */
  minutes: number;
  four: boolean;
  vegetarien: boolean;
  ingredients: Ingredient[];
  etapes: string[];
  avertissement?: string;
}
