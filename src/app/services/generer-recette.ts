import { Ingredient, ModeleRecette, RecetteGeneree } from '../models/recette';

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

  return {
    nom: modele.nom,
    temps: modele.temps,
    ingredients: [...modele.requis, ...restes, ...optionnels]
      .map((id) => ingredients.get(id))
      .filter((i): i is Ingredient => !!i),
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
