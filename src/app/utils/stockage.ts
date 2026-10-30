/**
 * Lecture et écriture dans le localStorage. Le stockage peut être indisponible
 * (navigation privée, données bloquées) : l'appli doit alors marcher quand même.
 */
export function lire<T>(cle: string, defaut: T): T {
  try {
    const brut = localStorage.getItem(cle);
    return brut ? (JSON.parse(brut) as T) : defaut;
  } catch {
    return defaut;
  }
}

export function ecrire(cle: string, valeur: unknown): void {
  try {
    localStorage.setItem(cle, JSON.stringify(valeur));
  } catch {
    // Pas de stockage : tant pis, la valeur reste en mémoire pour la session.
  }
}
