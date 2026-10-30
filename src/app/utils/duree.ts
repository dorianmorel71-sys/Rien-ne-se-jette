/**
 * Durées écrites dans un texte, en minutes : « 25 min », « 1 h », « 1 h 30 »,
 * « 1h15 », « 2 jours ». Pour « 12 à 15 min », on garde la plus courte
 * (minuteur : on vérifie plutôt tôt que tard) ou la plus longue (temps total).
 */
export function dureesDans(texte: string, borne: 'basse' | 'haute' = 'basse'): number[] {
  const motif =
    /(\d+(?:[,.]\d+)?)\s*(?:à\s*(\d+)\s*)?(min|h|jours?)(?![a-zà-ÿ])(?:\s*(\d{1,2})(?!\s*(?:h|jours?|°|%)(?![a-zà-ÿ]))(?:\s*min(?![a-zà-ÿ]))?)?/gi;
  const unites: Record<string, number> = { min: 1, h: 60, jour: 1440, jours: 1440 };
  return [...texte.matchAll(motif)].map(([, debut, fin, unite, minutes]) => {
    const nombre = borne === 'haute' && fin ? fin : debut;
    const valeur = Number(nombre.replace(',', '.')) * unites[unite.toLowerCase()];
    // « 1 h 30 » : les minutes après les heures.
    return unite.toLowerCase() === 'h' && minutes ? valeur + Number(minutes) : valeur;
  });
}

/**
 * Première durée de cuisson d'une étape, en minutes : « Cuis 25 min » → 25,
 * « Enfourne 1 h 30 » → 90. Les attentes en jours (pickles, sirops) ne sont
 * pas pour un minuteur.
 */
export function dureeDansEtape(texte: string): number | null {
  const [premiere] = dureesDans(texte);
  return premiere && premiere < 1440 ? premiere : null;
}

/** 95 secondes → « 1:35 » ; au-delà d'une heure, « 1:05:00 ». */
export function formaterDuree(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const heures = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secondes = String(total % 60).padStart(2, '0');
  return heures
    ? `${heures}:${String(minutes).padStart(2, '0')}:${secondes}`
    : `${minutes}:${secondes}`;
}

/** 25 → « 25 min », 60 → « 1 h », 90 → « 1 h 30 ». */
export function libelleMinutes(minutes: number): string {
  const heures = Math.floor(minutes / 60);
  const reste = Math.round(minutes % 60);
  if (!heures) return `${reste} min`;
  return reste ? `${heures} h ${String(reste).padStart(2, '0')}` : `${heures} h`;
}
