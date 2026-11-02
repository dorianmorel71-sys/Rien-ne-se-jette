import { LEGUMES_VISIBLES } from './visibles';

/**
 * Emoji (ou à défaut couleur) et sous-famille de l'aliment d'où vient chaque reste,
 * les mêmes que dans le Guide anti-gaspi.
 */
export const EMOJI_PAR_RESTE = new Map<string, string>();
export const COULEUR_PAR_RESTE = new Map<string, string>();
export const SOUS_FAMILLE_PAR_RESTE = new Map<string, string>();
for (const l of LEGUMES_VISIBLES) {
  for (const id of l.restes ?? []) {
    if (l.emoji && !EMOJI_PAR_RESTE.has(id)) EMOJI_PAR_RESTE.set(id, l.emoji);
    if (!COULEUR_PAR_RESTE.has(id)) COULEUR_PAR_RESTE.set(id, l.couleur);
    if (l.sousFamille && !SOUS_FAMILLE_PAR_RESTE.has(id))
      SOUS_FAMILLE_PAR_RESTE.set(id, l.sousFamille);
  }
}
