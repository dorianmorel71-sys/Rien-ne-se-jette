/**
 * Première durée de cuisson d'une étape, en minutes : « Cuis 25 min » → 25,
 * « 12 à 15 min » → 12 (on vérifie plutôt tôt que tard), « 1 h » → 60.
 * Les attentes en jours (pickles, sirops) ne sont pas pour un minuteur.
 */
export function dureeDansEtape(texte: string): number | null {
  const trouve = /(\d+(?:[,.]\d+)?)\s*(?:à\s*\d+\s*)?(min|h)\b/i.exec(texte);
  if (!trouve) return null;
  const nombre = Number(trouve[1].replace(',', '.'));
  const minutes = trouve[2].toLowerCase() === 'h' ? nombre * 60 : nombre;
  return minutes > 0 ? minutes : null;
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
