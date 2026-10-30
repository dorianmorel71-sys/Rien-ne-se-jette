import { DonneesCompteur } from '../services/compteur';
import { DonneesFavoris } from '../services/favoris';
import { Rangement } from '../services/frigo';

/** Ce qui est sauvegardé dans le compte. */
export interface DonneesCompte {
  favoris: DonneesFavoris;
  frigo: Rangement[];
  compteur: DonneesCompteur;
}

/**
 * Réunit les données de l'appareil et celles du compte, à la première connexion
 * sur un appareil : rien ne se perd, ni d'un côté ni de l'autre.
 */
export function fusionner(local: DonneesCompte, compte: DonneesCompte): DonneesCompte {
  const recettes = [...compte.favoris.recettes];
  for (const r of local.favoris.recettes) {
    if (!recettes.some((x) => x.nom === r.nom)) recettes.push(r);
  }


  // Le même compteur a pu avancer sur les deux appareils : on garde le plus grand.
  const fois = { ...compte.compteur.fois };
  for (const [nom, n] of Object.entries(local.compteur.fois)) {
    fois[nom] = Math.max(fois[nom] ?? 0, n);
  }

  return {
    favoris: {
      legumes: [...new Set([...compte.favoris.legumes, ...local.favoris.legumes])],
      recettes,
    },
    frigo: fusionnerFrigo(local.frigo, compte.frigo),
    compteur: {
      restes: Math.max(compte.compteur.restes, local.compteur.restes),
      recettes: Math.max(compte.compteur.recettes, local.compteur.recettes),
      fois,
    },
  };
}

/** Réunit deux frigos ; un même reste rangé des deux côtés garde la date la plus ancienne, par prudence. */
export function fusionnerFrigo(local: Rangement[], autre: Rangement[]): Rangement[] {
  const frigo = new Map(autre.map((r) => [r.id, r]));
  for (const r of local) {
    const deja = frigo.get(r.id);
    if (!deja || r.depuis < deja.depuis) frigo.set(r.id, r);
  }
  return [...frigo.values()];
}
