import { nomMois } from './saison';

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

/** Date du jour au format « 2026-10-30 », dans le fuseau de l'utilisateur. */
export function aujourdhui(maintenant = new Date()): string {
  const mois = String(maintenant.getMonth() + 1).padStart(2, '0');
  const jour = String(maintenant.getDate()).padStart(2, '0');
  return `${maintenant.getFullYear()}-${mois}-${jour}`;
}

function enDate(date: string): Date {
  const [annee, mois, jour] = date.split('-').map(Number);
  return new Date(annee, mois - 1, jour);
}

/** Nombre de jours entre deux dates « 2026-10-30 » (négatif si `a` est avant `de`). */
export function ecartEnJours(de: string, a: string): number {
  return Math.round((enDate(a).getTime() - enDate(de).getTime()) / 86_400_000);
}

/** « 2026-10-30 » + 3 → « 2026-11-02 ». */
export function ajouterJours(date: string, jours: number): string {
  const d = enDate(date);
  d.setDate(d.getDate() + jours);
  return aujourdhui(d);
}

/** « vendredi 30 octobre ». */
export function libelleDate(date: string): string {
  const d = enDate(date);
  return `${JOURS[d.getDay()]} ${d.getDate()} ${nomMois(d.getMonth() + 1)}`;
}
