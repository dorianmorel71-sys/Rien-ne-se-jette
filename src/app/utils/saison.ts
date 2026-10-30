const MOIS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

/** Nom du mois (1 à 12). */
export function nomMois(mois: number): string {
  return MOIS[mois - 1];
}

/** « de juin », « d'avril ». */
function de(mois: number): string {
  const nom = nomMois(mois);
  return /^[aeiouy]/.test(nom) ? `d'${nom}` : `de ${nom}`;
}

/**
 * « Toute l'année », « De juin à septembre », « D'octobre à mars »,
 * ou plusieurs périodes reliées par « et ».
 */
export function libelleSaison(mois: readonly number[]): string {
  if (mois.length >= 12) return "Toute l'année";
  const present = new Set(mois);
  const periodes: string[] = [];
  for (const debut of [...present].sort((a, b) => a - b)) {
    // Une période commence là où le mois précédent n'est pas de saison.
    if (present.has(debut === 1 ? 12 : debut - 1)) continue;
    let fin = debut;
    while (present.has((fin % 12) + 1)) fin = (fin % 12) + 1;
    periodes.push(fin === debut ? `en ${nomMois(debut)}` : `${de(debut)} à ${nomMois(fin)}`);
  }
  const texte = periodes.join(' et ');
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}
