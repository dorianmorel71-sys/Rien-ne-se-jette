/**
 * JSON aux clés triées : Firestore ne rend pas les champs dans l'ordre où on les a
 * envoyés, il faut donc trier pour comparer deux versions des mêmes données.
 */
export function jsonStable(valeur: unknown): string {
  return JSON.stringify(valeur, (_cle, v) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)))
      : v,
  );
}
