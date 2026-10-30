/** Une partie d'un légume (fanes, épluchures, trognon…) et ses usages. */
export interface PartieLegume {
  nom: string;
  /** Usages possibles. Peut contenir du HTML simple (<b>) pour mettre en avant une idée. */
  usages: string[];
}

export interface Legume {
  id: string;
  nom: string;
  /** Couleur de la pastille dans la liste. */
  couleur: string;
  score: string;
  intro: string;
  parties: PartieLegume[];
  avertissement?: string;
}
