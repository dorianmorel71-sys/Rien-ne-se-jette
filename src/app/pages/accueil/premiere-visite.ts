import { ecrire, lire } from '../../utils/stockage';

const CLE = 'rien-ne-se-jette.accueil-vu';

/** Page d'arrivée : l'accueil à la toute première visite, les légumes ensuite. */
export function pageDeDepart(): string {
  return lire(CLE, false) ? 'legume/carotte' : 'accueil';
}

export function marquerAccueilVu(): void {
  ecrire(CLE, true);
}
