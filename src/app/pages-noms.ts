import { FONCTIONNALITES } from '../environments/fonctionnalites';

/**
 * Nom, icône et phrase de chaque page : les mêmes dans le menu, en titre de page,
 * dans l'onglet du navigateur et sur l'accueil.
 */
export const PAGES = {
  aliments: {
    chemin: '/legume',
    icone: '🥕',
    nom: 'Guide anti-gaspi',
    /** Dans la barre de menu du téléphone, où la place manque. */
    nomCourt: 'Guide',
    phrase: FONCTIONNALITES.viandePoisson
      ? 'Que faire de chaque partie : épluchures, fanes, trognon, os, arêtes…'
      : 'Que faire de chaque partie : épluchures, fanes, trognon, croûtes…',
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
    phrase: FONCTIONNALITES.frigo
      ? 'Tes données sur tous tes appareils, et ton frigo partagé.'
      : 'Tes favoris et tes restes sauvés, gardés même après avoir fermé la page.',
  },
  avis: {
    chemin: '/avis',
    icone: '💬',
    nom: 'Ton avis',
    phrase: 'Un bug, une idée, un aliment qui manque ? Dis-le, chaque message est lu.',
  },
  confidentialite: {
    chemin: '/confidentialite',
    icone: '🔒',
    nom: 'Confidentialité',
    phrase: 'Ce que l’appli garde sur toi, où, et comment l’effacer.',
  },
  accueil: { chemin: '/accueil', icone: '❓', nom: 'Accueil', phrase: '' },
  invitation: { chemin: '/foyer', icone: '🏠', nom: 'Invitation', phrase: '' },
} as const;

/** « Frigo · Rien ne se jette » : le titre de l'onglet du navigateur. */
export function titreOnglet(nom: string): string {
  return `${nom} · Rien ne se jette`;
}
