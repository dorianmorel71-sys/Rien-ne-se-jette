import { Ingredient, ModeleRecette, RecetteGeneree } from '../models/recette';

/** Restes qui rendent une recette non végétarienne. */
const VIANDES = new Set(['poulet-cuit', 'jambon', 'viande-cuite', 'poisson-cuit']);

/** Durée totale en minutes : « 10 min + 1 h au four » → 70. */
export function enMinutes(temps: string): number {
  const unites: Record<string, number> = { min: 1, h: 60, jour: 1440, jours: 1440 };
  return [...temps.matchAll(/(\d+)\s*(min|h|jours?)\b/g)].reduce(
    (total, [, nombre, unite]) => total + Number(nombre) * unites[unite],
    0,
  );
}

/** « a », « a et b », « a, b et c ». */
export function enumerer(elements: string[]): string {
  if (elements.length <= 1) return elements.join('');
  return `${elements.slice(0, -1).join(', ')} et ${elements.at(-1)}`;
}

/**
 * Génère une recette à partir d'un modèle en n'utilisant que les ingrédients cochés.
 * Renvoie `null` si un ingrédient requis manque ou s'il n'y a pas assez de restes.
 */
export function genererRecette(
  modele: ModeleRecette,
  coches: ReadonlySet<string>,
  ingredients: ReadonlyMap<string, Ingredient>,
): RecetteGeneree | null {
  if (!modele.requis.every((id) => coches.has(id))) return null;

  const restes = modele.restes.filter((id) => coches.has(id));
  if (restes.length < (modele.minRestes ?? 1)) return null;

  const optionnels = modele.optionnels.filter((id) => coches.has(id));
  const texteRestes = enumerer(restes.map((id) => ingredients.get(id)?.avecArticle ?? id));

  const etapes = modele.etapes
    .map((etape) => (typeof etape === 'string' ? { texte: etape } : etape))
    .filter((e) => (!e.si || coches.has(e.si)) && (!e.sauf || !coches.has(e.sauf)))
    .filter((e) => restes.length > 0 || !e.texte.includes('{restes}'))
    .map((e) => majuscule(e.texte.replace('{restes}', texteRestes)));

  const avertissement = modele.avertissement;
  const utilises = [...modele.requis, ...restes, ...optionnels];

  return {
    nom: modele.nom,
    emoji: modele.emoji,
    temps: modele.temps,
    type: modele.type ?? 'salé',
    minutes: enMinutes(modele.temps),
    four: etapes.some((e) => /\bfour\b|enfourne/i.test(e)),
    vegetarien: !utilises.some((id) => VIANDES.has(id)),
    ingredients: utilises.map((id) => ingredients.get(id)).filter((i): i is Ingredient => !!i),
    etapes,
    avertissement:
      avertissement && (!avertissement.si || coches.has(avertissement.si))
        ? avertissement.texte
        : undefined,
  };
}

function majuscule(texte: string): string {
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}
