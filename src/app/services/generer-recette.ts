import { Ingredient, ModeleRecette, RecetteGeneree } from '../models/recette';
import { dureesDans } from '../utils/duree';

/** Restes qui rendent une recette non végétarienne. */
const VIANDES = new Set([
  'poulet-cuit',
  'jambon',
  'viande-cuite',
  'poisson-cuit',
  'lardons',
  'saucisses',
  'chorizo',
  'carcasse-poulet',
  'os-viande',
  'graisse-cuisson',
  'aretes-poisson',
  'peau-saumon',
  'carapaces-crevettes',
  'thon-boite',
  'sardines-boite',
]);

/** Durée totale en minutes : « 10 min + 1 h 30 au four » → 100. */
export function enMinutes(temps: string): number {
  return dureesDans(temps, 'haute').reduce((total, minutes) => total + minutes, 0);
}

/** Noms féminins en tête des restes (« les épluchures de carotte »), pour accorder les étapes. */
const NOMS_FEMININS = new Set([
  'aubergine',
  'bananes',
  'carapaces',
  'carcasse',
  'céréales',
  'châtaignes',
  'côtes',
  'cosses',
  'crêpes',
  'croûte',
  'eau',
  'écorce',
  'endives',
  'épices',
  'épluchures',
  'fanes',
  'feuilles',
  'figues',
  'graines',
  'grosses',
  'herbes',
  'huile',
  'lentilles',
  'miettes',
  'noix',
  'pâtes',
  'peaux',
  'pelures',
  'pommes',
  'queues',
  'sardines',
  'saucisses',
  'têtes',
  'tiges',
  'tomates',
]);

/** Nom en tête d'un reste, sans son article : « les fanes de radis » → « fanes ». */
export function nomDeTete(avecArticle: string): string {
  return avecArticle.replace(/^(les |le |la |l'|l’|des |du )/, '').split(/[\s']/)[0];
}

/** Genre et nombre d'un groupe de restes, pour accorder « coupés » et « -les » dans les étapes. */
export function accord(restes: Ingredient[]): { feminin: boolean; pluriel: boolean } {
  const pluriel = restes.length > 1 || restes.some((r) => /^(les|des) | et /.test(r.avecArticle));
  const feminin = restes.every(
    (r) =>
      !/ et l/.test(r.avecArticle) &&
      (r.avecArticle.startsWith('la ') || NOMS_FEMININS.has(nomDeTete(r.avecArticle))),
  );
  return { feminin, pluriel };
}

/**
 * Accorde une étape écrite au masculin pluriel avec les restes cochés :
 * « Ajoute {restes} coupés » → « Ajoute la courgette coupée », et « mets-les » → « mets-la ».
 */
function accorder(texte: string, { feminin, pluriel }: { feminin: boolean; pluriel: boolean }) {
  const pronom = pluriel ? 'les' : feminin ? 'la' : 'le';
  // {les} et {leur} : les restes repris dans une étape suivante (« mets-{les} »).
  texte = texte.replaceAll('{les}', pronom).replaceAll('{leur}', pluriel ? 'leur' : 'son');
  if (!texte.includes('{restes}')) return texte;
  const fin = (feminin ? 'e' : '') + (pluriel ? 's' : '');
  return texte
    .replace(/(\{restes\}(?: bien| très bien)?) (\p{L}+)és\b/u, `$1 $2é${fin}`)
    .replace(/-les\b/g, `-${pronom}`);
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
  // Texte et accord des restes d'une étape, sans ceux qu'elle écarte.
  const restesDe = (sans: string[] = []) =>
    restes
      .filter((id) => !sans.includes(id))
      .map((id) => ingredients.get(id))
      .filter((i): i is Ingredient => !!i);

  const etapes = modele.etapes
    .map((etape) => (typeof etape === 'string' ? { texte: etape } : etape))
    .filter((e) => (!e.si || coches.has(e.si)) && (!e.sauf || !coches.has(e.sauf)))
    .map((e) => ({ texte: e.texte, restes: restesDe(e.sansRestes) }))
    .filter((e) => e.restes.length > 0 || !e.texte.includes('{restes}'))
    .map((e) =>
      majuscule(
        accorder(e.texte, accord(e.restes)).replace(
          '{restes}',
          enumerer(e.restes.map((i) => i.avecArticle)),
        ),
      ),
    );

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
