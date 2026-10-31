import { ecrire, lire } from '../../utils/stockage';

const CLE = 'rien-ne-se-jette.accueil-vu';
const CLE_FICHE = 'rien-ne-se-jette.derniere-fiche';

/**
 * Page d'arrivée : l'accueil à la toute première visite, ensuite la dernière fiche
 * consultée (la carotte au départ). `fiche` : on veut une fiche, pas l'accueil.
 */
export function pageDeDepart(fiche = false): string {
  if (!fiche && !lire(CLE, false)) return 'accueil';
  return `legume/${lire(CLE_FICHE, 'carotte')}`;
}

export function marquerAccueilVu(): void {
  ecrire(CLE, true);
}

export function retenirFiche(id: string): void {
  ecrire(CLE_FICHE, id);
}
