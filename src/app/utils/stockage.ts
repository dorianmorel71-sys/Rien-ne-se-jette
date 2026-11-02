import { FIREBASE_CONFIG } from '../firebase.config';

/** Mémorise, sur l'appareil, qu'un compte y est connecté. */
const CLE_CONNECTE = 'rien-ne-se-jette.connecte';

/**
 * Données personnelles : sans compte, elles ne vivent que le temps de l'onglet
 * (fermer la page les efface) ; avec un compte, elles restent sur l'appareil.
 * Les autres clés (réglages techniques) restent toujours sur l'appareil.
 */
export const CLES_PERSONNELLES = [
  'rien-ne-se-jette.compteur',
  'rien-ne-se-jette.favoris',
  'rien-ne-se-jette.frigo',
  'rien-ne-se-jette.placard',
  'rien-ne-se-jette.placard-demande',
  'rien-ne-se-jette.derniere-fiche',
];

/** Sans comptes configurés, impossible d'en créer un : on garde tout sur l'appareil. */
const AVEC_COMPTES = !!FIREBASE_CONFIG.apiKey;

function connecte(): boolean {
  try {
    return !AVEC_COMPTES || localStorage.getItem(CLE_CONNECTE) === 'true';
  } catch {
    return false;
  }
}

function stockagePour(cle: string): Storage {
  return CLES_PERSONNELLES.includes(cle) && !connecte() ? sessionStorage : localStorage;
}

/**
 * Lecture et écriture dans le stockage du navigateur. Le stockage peut être indisponible
 * (navigation privée, données bloquées) : l'appli doit alors marcher quand même.
 */
export function lire<T>(cle: string, defaut: T): T {
  try {
    const brut = stockagePour(cle).getItem(cle);
    return brut ? (JSON.parse(brut) as T) : defaut;
  } catch {
    return defaut;
  }
}

export function ecrire(cle: string, valeur: unknown): void {
  try {
    stockagePour(cle).setItem(cle, JSON.stringify(valeur));
  } catch {
    // Pas de stockage : tant pis, la valeur reste en mémoire pour la session.
  }
}

/**
 * À chaque changement de connexion : avec un compte, les données personnelles passent
 * de l'onglet à l'appareil ; sans compte, elles repassent dans l'onglet (elles
 * s'effaceront à sa fermeture) et ce qu'une ancienne version avait laissé est effacé.
 */
export function garderSurAppareil(garder: boolean): void {
  if (!AVEC_COMPTES) return;
  try {
    const etaitConnecte = connecte();
    for (const cle of CLES_PERSONNELLES) {
      if (garder && !etaitConnecte) {
        const valeur = sessionStorage.getItem(cle);
        if (valeur !== null) localStorage.setItem(cle, valeur);
        sessionStorage.removeItem(cle);
      } else if (!garder) {
        const valeur = localStorage.getItem(cle);
        if (etaitConnecte && valeur !== null) sessionStorage.setItem(cle, valeur);
        localStorage.removeItem(cle);
      }
    }
    if (garder) localStorage.setItem(CLE_CONNECTE, 'true');
    else localStorage.removeItem(CLE_CONNECTE);
  } catch {
    // Pas de stockage : rien à déplacer.
  }
}
