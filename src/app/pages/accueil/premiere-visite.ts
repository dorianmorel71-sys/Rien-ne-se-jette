import { ecrire, lire } from '../../utils/stockage';

const CLE_FICHE = 'rien-ne-se-jette.derniere-fiche';

/** Fiche du Guide anti-gaspi à rouvrir : la dernière consultée, la carotte au départ. */
export function ficheDeDepart(): string {
  return `legume/${lire(CLE_FICHE, 'carotte')}`;
}

export function retenirFiche(id: string): void {
  ecrire(CLE_FICHE, id);
}
