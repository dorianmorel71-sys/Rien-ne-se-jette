/** Sans accents ni majuscules, pour une recherche tolérante. */
export const normaliser = (texte: string) =>
  texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
