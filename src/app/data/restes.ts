import { GroupeRestes, Recette } from '../models/recette';

export const GROUPES_RESTES: GroupeRestes[] = [
  {
    titre: 'Épluchures et fanes',
    restes: [
      { id: 'fanes-carotte', nom: 'Fanes de carotte' },
      { id: 'epl-carotte', nom: 'Épluchures de carotte' },
      { id: 'epl-pdt', nom: 'Épluchures de pomme de terre' },
      { id: 'epl-courgette', nom: 'Épluchures de courgette' },
      { id: 'fanes-radis', nom: 'Fanes de radis' },
      { id: 'feuilles-betterave', nom: 'Feuilles de betterave' },
      { id: 'pelures-oignon', nom: "Pelures d'oignon" },
      { id: 'cosses-pois', nom: 'Cosses de petits pois' },
    ],
  },
  {
    titre: 'Bouts de légumes',
    restes: [
      { id: 'vert-poireau', nom: 'Vert de poireau' },
      { id: 'tronc-brocoli', nom: 'Tronc de brocoli' },
      { id: 'feuilles-chou-fleur', nom: 'Feuilles de chou-fleur' },
      { id: 'feuilles-celeri', nom: 'Feuilles de céleri' },
      { id: 'tiges-herbes', nom: "Tiges d'herbes" },
      { id: 'graines-courge', nom: 'Graines de courge' },
      { id: 'legumes-fatigues', nom: 'Légumes un peu fatigués' },
    ],
  },
  {
    titre: 'Restes de repas',
    restes: [
      { id: 'pain-rassis', nom: 'Pain rassis' },
      { id: 'riz-cuit', nom: 'Riz cuit' },
      { id: 'pates-cuites', nom: 'Pâtes cuites' },
      { id: 'fromage-bouts', nom: 'Bouts de fromage' },
    ],
  },
  {
    titre: 'Fruits',
    restes: [
      { id: 'epl-pomme', nom: 'Épluchures et trognons de pomme' },
      { id: 'zeste', nom: "Peau de citron ou d'orange" },
      { id: 'peaux-tomate', nom: 'Peaux de tomate' },
    ],
  },
];

/** Restes cochés au premier affichage, pour montrer l'exemple. */
export const RESTES_EXEMPLE = [
  'fanes-carotte',
  'vert-poireau',
  'epl-pdt',
  'fromage-bouts',
  'riz-cuit',
];

export const RECETTES: Recette[] = [
  {
    nom: 'Bouillon zéro déchet',
    temps: '10 min + 45 min de cuisson',
    ingredients: [
      'epl-carotte',
      'vert-poireau',
      'pelures-oignon',
      'tiges-herbes',
      'feuilles-celeri',
      'tronc-brocoli',
      'cosses-pois',
    ],
    base: 'eau, sel, 1 feuille de laurier',
    etapes: [
      "Mets tous les restes bien lavés dans une grande casserole et couvre d'eau (environ 1,5 L).",
      'Ajoute le sel et le laurier, laisse frémir 45 min à couvert.',
      'Filtre, puis garde 4 jours au frigo ou congèle en portions. Les restes cuits vont au compost.',
    ],
  },
  {
    nom: 'Pesto de fanes',
    temps: '10 min',
    ingredients: [
      'fanes-carotte',
      'fanes-radis',
      'tiges-herbes',
      'epl-courgette',
      'graines-courge',
      'fromage-bouts',
    ],
    base: "1 gousse d'ail, huile d'olive, sel",
    etapes: [
      'Lave et sèche les fanes ou épluchures.',
      "Mixe avec l'ail, les graines (ou des noix) et le fromage râpé.",
      "Ajoute l'huile petit à petit jusqu'à une texture de sauce. Sur des pâtes, en tartine ou dans un sandwich.",
    ],
  },
  {
    nom: 'Soupe verte des restes',
    temps: '35 min',
    ingredients: [
      'fanes-radis',
      'fanes-carotte',
      'vert-poireau',
      'feuilles-betterave',
      'feuilles-celeri',
      'legumes-fatigues',
      'feuilles-chou-fleur',
    ],
    base: "1 pomme de terre, 1 oignon, 1 L d'eau ou de bouillon",
    etapes: [
      "Fais revenir l'oignon émincé et le vert de poireau 5 min dans un peu d'huile.",
      "Ajoute la pomme de terre en dés, l'eau et les autres restes, cuis 25 min.",
      'Mixe, sale, poivre. Un peu de fromage ou de crème en finition.',
    ],
  },
  {
    nom: "Chips d'épluchures mélangées",
    temps: '5 min + 15 min au four',
    ingredients: ['epl-pdt', 'epl-carotte', 'feuilles-chou-fleur', 'feuilles-betterave'],
    base: 'huile, sel, paprika ou épices au choix',
    etapes: [
      'Préchauffe le four à 200 °C. Lave et sèche bien les épluchures.',
      "Mélange avec un filet d'huile, le sel et les épices, étale sans superposer.",
      'Enfourne 12 à 15 min en surveillant : elles doivent dorer sans brûler.',
    ],
    avertissement: 'Retire les parties vertes des épluchures de pomme de terre.',
  },
  {
    nom: 'Galettes croustillantes',
    temps: '25 min',
    ingredients: [
      'epl-carotte',
      'epl-courgette',
      'tronc-brocoli',
      'riz-cuit',
      'fromage-bouts',
      'tiges-herbes',
      'fanes-carotte',
    ],
    base: '1 œuf, 3 c. à soupe de farine, sel',
    etapes: [
      "Râpe ou hache finement les restes de légumes, presse la courgette pour enlever l'eau.",
      "Mélange avec l'œuf, la farine, le riz et le fromage. La pâte doit tenir.",
      'Forme des galettes et dore-les 4 min de chaque côté dans une poêle huilée.',
    ],
  },
  {
    nom: 'Omelette fond de frigo',
    temps: '15 min',
    ingredients: [
      'legumes-fatigues',
      'pates-cuites',
      'fromage-bouts',
      'vert-poireau',
      'tiges-herbes',
      'fanes-radis',
      'feuilles-betterave',
      'epl-pdt',
    ],
    base: '3 œufs, sel, poivre',
    etapes: [
      'Fais revenir les légumes coupés petits (et les pâtes) 5 min à la poêle.',
      'Bats les œufs avec les herbes hachées, sel et poivre.',
      'Verse sur les légumes, ajoute le fromage, cuis à feu doux à couvert 5 min.',
    ],
  },
  {
    nom: 'Gratin des restes',
    temps: '10 min + 20 min au four',
    ingredients: [
      'pates-cuites',
      'riz-cuit',
      'legumes-fatigues',
      'fromage-bouts',
      'vert-poireau',
      'tronc-brocoli',
      'feuilles-chou-fleur',
      'pain-rassis',
    ],
    base: '20 cl de lait ou de crème, 1 œuf',
    etapes: [
      'Mélange pâtes ou riz avec les légumes coupés dans un plat.',
      "Bats le lait et l'œuf, verse dessus. Couvre de fromage et de pain rassis émietté.",
      "Enfourne 20 min à 200 °C, jusqu'à ce que ce soit doré.",
    ],
  },
  {
    nom: 'Riz sauté express',
    temps: '15 min',
    ingredients: [
      'riz-cuit',
      'tronc-brocoli',
      'vert-poireau',
      'legumes-fatigues',
      'fanes-radis',
      'feuilles-chou-fleur',
    ],
    base: "1 œuf, sauce soja, 1 gousse d'ail",
    etapes: [
      "Fais sauter l'ail et les légumes coupés fins 4 min à feu vif.",
      'Ajoute le riz froid, fais-le dorer 3 min en remuant.',
      "Pousse sur le côté, brouille l'œuf, mélange tout et ajoute la sauce soja.",
    ],
  },
  {
    nom: 'Velouté de cosses',
    temps: '40 min',
    ingredients: ['cosses-pois', 'vert-poireau', 'feuilles-celeri', 'tiges-herbes'],
    base: "1 pomme de terre, 1 oignon, 1 L d'eau",
    etapes: [
      "Fais revenir l'oignon et le poireau, ajoute les cosses, la pomme de terre et l'eau.",
      'Cuis 25 min, puis mixe longtemps.',
      'Passe au tamis pour retirer les fibres, rectifie le sel.',
    ],
  },
  {
    nom: 'Pain perdu salé',
    temps: '20 min',
    ingredients: [
      'pain-rassis',
      'fromage-bouts',
      'tiges-herbes',
      'legumes-fatigues',
      'vert-poireau',
    ],
    base: '2 œufs, 15 cl de lait, sel, poivre',
    etapes: [
      'Bats œufs, lait, herbes hachées, sel et poivre.',
      'Trempe les tranches de pain, dore-les à la poêle 3 min par face.',
      'Garnis de fromage fondu et de légumes poêlés.',
    ],
  },
  {
    nom: 'Quiche sans gâchis',
    temps: '15 min + 35 min au four',
    ingredients: [
      'legumes-fatigues',
      'vert-poireau',
      'feuilles-betterave',
      'fromage-bouts',
      'fanes-carotte',
      'tronc-brocoli',
      'feuilles-chou-fleur',
    ],
    base: '1 pâte, 3 œufs, 20 cl de crème ou de lait',
    etapes: [
      'Fais revenir les restes de légumes coupés 5 à 10 min.',
      'Étale-les sur la pâte, ajoute le fromage.',
      'Verse œufs et crème battus, enfourne 35 min à 180 °C.',
    ],
  },
  {
    nom: 'Sel aromatique maison',
    temps: '10 min + 1 h au four doux',
    ingredients: ['feuilles-celeri', 'zeste', 'peaux-tomate', 'tiges-herbes'],
    base: 'gros sel',
    etapes: [
      'Étale les restes sur une plaque et sèche-les 1 h au four à 90 °C.',
      'Mixe avec deux fois leur volume de gros sel.',
      'Garde dans un bocal : parfait sur les légumes, viandes et salades.',
    ],
  },
  {
    nom: 'Chips de pomme et infusion',
    temps: '10 min + 1 h au four',
    ingredients: ['epl-pomme', 'zeste'],
    base: 'cannelle, un peu de sucre',
    etapes: [
      'Pour les chips : épluchures, cannelle et sucre, 1 h au four à 100 °C.',
      "Pour l'infusion : trognons (sans pépins) et zeste dans l'eau frémissante 10 min.",
      'Filtre et bois chaud, avec un peu de miel si tu veux.',
    ],
  },
  {
    nom: 'Croûtons et chapelure',
    temps: '15 min',
    ingredients: ['pain-rassis', 'tiges-herbes', 'fromage-bouts', 'zeste'],
    base: "huile d'olive, ail",
    etapes: [
      'Coupe le pain en cubes, mélange avec huile, ail et herbes.',
      'Dore 10 min au four à 180 °C ou à la poêle.',
      'Le reste mixé fait une chapelure, avec un peu de zeste ou de fromage râpé.',
    ],
  },
];
