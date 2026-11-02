import { SOUS_FAMILLES } from '../data/legumes';
import { CategorieLegume } from '../models/legume';

/** Une partie d'une famille, sous son sous-titre (null : la famille n'en a pas). */
export interface SousGroupe<T> {
  titre: string | null;
  elements: T[];
}

/**
 * Range les éléments d'une famille sous ses sous-titres, dans l'ordre de SOUS_FAMILLES,
 * pour que le Guide et Recettes affichent le même classement. Ceux qui n'ont pas de
 * sous-famille vont à la fin, sous `titreSans`.
 */
export function enSousGroupes<T>(
  famille: string,
  elements: T[],
  sousFamille: (element: T) => string | undefined,
  titreSans: string | null = null,
): SousGroupe<T>[] {
  const ordre = SOUS_FAMILLES[famille as CategorieLegume];
  if (!ordre) return [{ titre: null, elements }];
  return [...ordre, titreSans]
    .map((titre) => ({
      titre,
      elements: elements.filter((e) => (sousFamille(e) ?? titreSans) === titre),
    }))
    .filter((g) => g.elements.length > 0);
}
