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

/** Temps qu'il reste avant la date d'un reste, en court : « aujourd'hui », « demain », « 3 j ». */
export function libelleDelai(joursRestants: number): string {
  if (joursRestants < 0) return 'date passée';
  if (joursRestants === 0) return 'aujourd’hui';
  if (joursRestants === 1) return 'demain';
  return `${joursRestants} j`;
}

/** Couleur d'un délai : rouge si urgent, moutarde bientôt, vert sinon. */
export function niveauDelai(joursRestants: number): 'urgent' | 'bientot' | 'ok' {
  if (estUrgent(joursRestants)) return 'urgent';
  return joursRestants <= 3 ? 'bientot' : 'ok';
}
