/**
 * Nom, icône et phrase de chaque page : les mêmes dans le menu, en titre de page,
 * dans l'onglet du navigateur et sur l'accueil.
 */
export const PAGES = {
  aliments: {
    chemin: '/legume',
    icone: '🥕',
    nom: 'Aliments',
    phrase: 'Que faire de chaque partie : épluchures, fanes, trognon, os, arêtes…',
  },
  recettes: {
    chemin: '/restes',
    icone: '🍲',
    nom: 'Recettes',
    phrase: 'Coche ce que tu as : on te propose quoi cuisiner avec.',
  },
  frigo: {
    chemin: '/frigo',
    icone: '🧊',
    nom: 'Frigo',
    phrase: 'Ce que tu as mis de côté, le plus urgent d’abord.',
  },
  favoris: {
    chemin: '/favoris',
    icone: '🔖',
    nom: 'Favoris',
    phrase: 'Les fiches et les recettes que tu as gardées.',
  },
  compte: {
    chemin: '/compte',
    icone: '👤',
    nom: 'Compte',
    phrase: 'Tes données sur tous tes appareils, et ton frigo partagé.',
  },
  accueil: { chemin: '/accueil', icone: '❓', nom: 'Accueil', phrase: '' },
  invitation: { chemin: '/foyer', icone: '🏠', nom: 'Invitation', phrase: '' },
} as const;

/** « Frigo · Rien ne se jette » : le titre de l'onglet du navigateur. */
export function titreOnglet(nom: string): string {
  return `${nom} · Rien ne se jette`;
}
