import { GROUPES_INGREDIENTS } from './ingredients';

/** Le placard ne va pas au frigo. */
export const GROUPE_PLACARD = 'Dans mon placard';

/** Au congélateur : on conseille de consommer dans les 3 mois. */
export const JOURS_CONGELATEUR = 90;
/** Une fois décongelé, un reste se mange dans les 24 h. */
export const JOURS_DECONGELE = 1;

/** Nombre de jours au frigo, par défaut pour chaque famille de restes. */
const JOURS_PAR_GROUPE: Record<string, number> = {
  Légumes: 3,
  Fruits: 3,
  'Herbes & aromates': 3,
  'Viande & poisson': 2,
  'Épicerie & crèmerie': 3,
};

/** Restes qui se gardent nettement moins ou plus longtemps que leur famille. */
const JOURS_PAR_RESTE: Record<string, number> = {
  // Bouts de légumes plus solides que les épluchures.
  'vert-poireau': 4,
  'tronc-brocoli': 4,
  'feuilles-chou-fleur': 4,
  'trognon-chou-fleur': 4,
  'feuilles-chou': 4,
  'cotes-blettes': 4,
  'feuilles-celeri': 4,
  'coeur-courgette': 4,
  'filaments-courge': 4,
  'pieds-champignons': 4,
  'tiges-herbes': 4,
  'legumes-fatigues': 4,
  'endives-molles': 4,
  'poivron-ride': 4,
  'aubergine-molle': 4,
  'champignons-mous': 4,
  'bouts-haricots': 4,

  'fanes-carotte': 2,
  'fanes-radis': 2,
  'fanes-navet': 2,
  'feuilles-betterave': 2,
  'plumet-fenouil': 2,
  'pelures-oignon': 14,
  'epl-gingembre': 7,
  'epis-mais': 2,
  'tomates-mures': 2,
  'salade-fanee': 2,
  'herbes-fanees': 2,
  'epinards-fanes': 2,
  'graines-courge': 2,
  'trognon-chou': 7,
  'pain-rassis': 7,
  'brioche-rassise': 5,
  'riz-cuit': 2,
  'poisson-cuit': 2,
  'poulet-cuit': 3,
  'viande-cuite': 3,
  lardons: 4,
  saucisses: 3,
  chorizo: 14,
  'carcasse-poulet': 2,
  'os-viande': 3,
  'graisse-cuisson': 30,
  'aretes-poisson': 1,
  'peau-saumon': 1,
  'carapaces-crevettes': 1,
  jambon: 3,
  aquafaba: 3,
  'fromage-bouts': 10,
  'croute-parmesan': 30,
  yaourt: 5,
  'jaunes-oeufs': 1,
  'miettes-gateau': 5,
  'fond-confiture': 30,
  'fond-vin': 4,
  'bananes-mures': 2,
  'avocat-mur': 1,
  'fruits-abimes': 2,
  'fruits-exotiques-abimes': 2,
  'peau-banane': 2,
  zeste: 7,
  'queues-cerises': 30,
  'fruits-rouges-abimes': 2,
  'figues-mures': 2,
  'kakis-murs': 2,
  'epl-coing': 2,
  'fruits-secs': 60,
};

const GROUPE_PAR_RESTE = new Map(
  GROUPES_INGREDIENTS.flatMap((g) => g.ingredients.map((i) => [i.id, g.titre] as const)),
);

/** Combien de jours ce reste se garde au frigo une fois mis de côté. */
export function joursAuFrigo(id: string): number {
  return JOURS_PAR_RESTE[id] ?? JOURS_PAR_GROUPE[GROUPE_PAR_RESTE.get(id) ?? ''] ?? 3;
}
