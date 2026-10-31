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
    phrase: 'Quoi cuisiner avec ce que tu as, en commençant par les restes à finir.',
  },
  frigo: {
    chemin: '/frigo',
    icone: '🧊',
    nom: 'Frigo',
    phrase: 'Ce que tu as mis de côté, le plus urgent d’abord.',
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
