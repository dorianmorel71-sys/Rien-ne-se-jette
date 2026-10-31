/**
 * Poids d'un reste selon le temps qu'il lui reste : plus il est près de sa date,
 * plus une recette qui l'utilise passe devant.
 */
export function poidsUrgence(joursRestants: number): number {
  if (joursRestants <= 0) return 4;
  if (joursRestants === 1) return 3;
  if (joursRestants <= 3) return 2;
  return 1;
}

/** À finir aujourd'hui ou demain, ou déjà dépassé. */
export function estUrgent(joursRestants: number): boolean {
  return joursRestants <= 1;
}
