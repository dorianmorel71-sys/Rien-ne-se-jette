import { GroupeIngredients } from '../models/recette';

/** Supposés toujours disponibles : ils ne se cochent pas. */
export const INDISPENSABLES = "de l'eau, du sel, du poivre et de l'huile";

export const GROUPES_INGREDIENTS: GroupeIngredients[] = [
  {
    titre: 'Épluchures et fanes',
    ingredients: [
      { id: 'fanes-carotte', nom: 'Fanes de carotte', avecArticle: 'les fanes de carotte' },
      { id: 'epl-carotte', nom: 'Épluchures de carotte', avecArticle: 'les épluchures de carotte' },
      {
        id: 'epl-pdt',
        nom: 'Épluchures de pomme de terre',
        avecArticle: 'les épluchures de pomme de terre',
      },
      {
        id: 'epl-courgette',
        nom: 'Épluchures de courgette',
        avecArticle: 'les épluchures de courgette',
      },
      { id: 'fanes-radis', nom: 'Fanes de radis', avecArticle: 'les fanes de radis' },
      {
        id: 'feuilles-betterave',
        nom: 'Feuilles de betterave',
        avecArticle: 'les feuilles de betterave',
      },
      { id: 'pelures-oignon', nom: "Pelures d'oignon", avecArticle: "les pelures d'oignon" },
      {
        id: 'cosses-pois',
        nom: 'Cosses de petits pois',
        avecArticle: 'les cosses de petits pois',
      },
    ],
  },
  {
    titre: 'Bouts de légumes',
    ingredients: [
      { id: 'vert-poireau', nom: 'Vert de poireau', avecArticle: 'le vert de poireau' },
      { id: 'tronc-brocoli', nom: 'Tronc de brocoli', avecArticle: 'le tronc de brocoli' },
      {
        id: 'feuilles-chou-fleur',
        nom: 'Feuilles de chou-fleur',
        avecArticle: 'les feuilles de chou-fleur',
      },
      { id: 'feuilles-celeri', nom: 'Feuilles de céleri', avecArticle: 'les feuilles de céleri' },
      { id: 'tiges-herbes', nom: "Tiges d'herbes", avecArticle: "les tiges d'herbes" },
      { id: 'graines-courge', nom: 'Graines de courge', avecArticle: 'les graines de courge' },
      {
        id: 'legumes-fatigues',
        nom: 'Légumes un peu fatigués',
        avecArticle: 'les légumes fatigués',
      },
    ],
  },
  {
    titre: 'Restes de repas',
    ingredients: [
      { id: 'pain-rassis', nom: 'Pain rassis', avecArticle: 'le pain rassis' },
      { id: 'riz-cuit', nom: 'Riz cuit', avecArticle: 'le riz cuit' },
      { id: 'pates-cuites', nom: 'Pâtes cuites', avecArticle: 'les pâtes cuites' },
      { id: 'fromage-bouts', nom: 'Bouts de fromage', avecArticle: 'les bouts de fromage' },
    ],
  },
  {
    titre: 'Fruits',
    ingredients: [
      {
        id: 'epl-pomme',
        nom: 'Épluchures et trognons de pomme',
        avecArticle: 'les épluchures et trognons de pomme',
      },
      { id: 'zeste', nom: "Peau de citron ou d'orange", avecArticle: "la peau d'agrume" },
      { id: 'peaux-tomate', nom: 'Peaux de tomate', avecArticle: 'les peaux de tomate' },
    ],
  },
  {
    titre: 'Dans mon placard',
    ingredients: [
      { id: 'oeufs', nom: 'Œufs', avecArticle: 'les œufs' },
      { id: 'lait', nom: 'Lait ou crème', avecArticle: 'le lait' },
      { id: 'farine', nom: 'Farine', avecArticle: 'la farine' },
      { id: 'oignon', nom: 'Oignon', avecArticle: "l'oignon" },
      { id: 'ail', nom: 'Ail', avecArticle: "l'ail" },
      { id: 'pomme-de-terre', nom: 'Pomme de terre', avecArticle: 'la pomme de terre' },
      { id: 'pate', nom: 'Pâte à tarte', avecArticle: 'la pâte à tarte' },
      { id: 'sucre', nom: 'Sucre', avecArticle: 'le sucre' },
      { id: 'sauce-soja', nom: 'Sauce soja', avecArticle: 'la sauce soja' },
    ],
  },
];

/** Cochés au premier affichage, pour montrer l'exemple. */
export const INGREDIENTS_EXEMPLE = [
  'fanes-carotte',
  'vert-poireau',
  'epl-pdt',
  'fromage-bouts',
  'riz-cuit',
];
