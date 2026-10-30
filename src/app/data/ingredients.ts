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
        id: 'epl-patate-douce',
        nom: 'Épluchures de patate douce',
        avecArticle: 'les épluchures de patate douce',
      },
      { id: 'epl-panais', nom: 'Épluchures de panais', avecArticle: 'les épluchures de panais' },
      {
        id: 'epl-celeri-rave',
        nom: 'Épluchures de céleri-rave',
        avecArticle: 'les épluchures de céleri-rave',
      },
      {
        id: 'epl-courgette',
        nom: 'Épluchures de courgette',
        avecArticle: 'les épluchures de courgette',
      },
      {
        id: 'epl-concombre',
        nom: 'Épluchures de concombre',
        avecArticle: 'les épluchures de concombre',
      },
      {
        id: 'epl-asperge',
        nom: "Talons et épluchures d'asperge",
        avecArticle: "les talons et épluchures d'asperge",
      },
      { id: 'fanes-radis', nom: 'Fanes de radis', avecArticle: 'les fanes de radis' },
      { id: 'fanes-navet', nom: 'Fanes de navet', avecArticle: 'les fanes de navet' },
      {
        id: 'feuilles-betterave',
        nom: 'Feuilles de betterave',
        avecArticle: 'les feuilles de betterave',
      },
      { id: 'plumet-fenouil', nom: 'Plumet de fenouil', avecArticle: 'le plumet de fenouil' },
      { id: 'pelures-oignon', nom: "Pelures d'oignon", avecArticle: "les pelures d'oignon" },
      {
        id: 'cosses-pois',
        nom: 'Cosses de petits pois',
        avecArticle: 'les cosses de petits pois',
      },
      { id: 'cosses-feves', nom: 'Cosses de fèves', avecArticle: 'les cosses de fèves' },
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
      {
        id: 'trognon-chou-fleur',
        nom: 'Trognon de chou-fleur',
        avecArticle: 'le trognon de chou-fleur',
      },
      {
        id: 'feuilles-chou',
        nom: 'Grosses feuilles de chou',
        avecArticle: 'les grosses feuilles de chou',
      },
      { id: 'cotes-blettes', nom: 'Côtes de blettes', avecArticle: 'les côtes de blettes' },
      { id: 'feuilles-celeri', nom: 'Feuilles de céleri', avecArticle: 'les feuilles de céleri' },
      {
        id: 'coeur-courgette',
        nom: 'Cœur de grosse courgette',
        avecArticle: 'le cœur de courgette',
      },
      {
        id: 'filaments-courge',
        nom: 'Filaments de courge',
        avecArticle: 'les filaments de courge',
      },
      { id: 'graines-courge', nom: 'Graines de courge', avecArticle: 'les graines de courge' },
      {
        id: 'pieds-champignons',
        nom: 'Pieds de champignons',
        avecArticle: 'les pieds de champignons',
      },
      {
        id: 'tomates-mures',
        nom: 'Tomates trop mûres',
        avecArticle: 'les tomates trop mûres',
      },
      { id: 'salade-fanee', nom: 'Salade un peu fanée', avecArticle: 'la salade fanée' },
      { id: 'tiges-herbes', nom: "Tiges d'herbes", avecArticle: "les tiges d'herbes" },
      { id: 'herbes-fanees', nom: 'Herbes fanées', avecArticle: 'les herbes fanées' },
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
      {
        id: 'brioche-rassise',
        nom: 'Brioche ou viennoiseries rassises',
        avecArticle: 'la brioche rassise',
      },
      { id: 'riz-cuit', nom: 'Riz cuit', avecArticle: 'le riz cuit' },
      { id: 'pates-cuites', nom: 'Pâtes cuites', avecArticle: 'les pâtes cuites' },
      {
        id: 'semoule-cuite',
        nom: 'Semoule ou boulgour cuits',
        avecArticle: 'la semoule cuite',
      },
      {
        id: 'pdt-cuites',
        nom: 'Pommes de terre cuites',
        avecArticle: 'les pommes de terre cuites',
      },
      { id: 'puree', nom: 'Reste de purée', avecArticle: 'le reste de purée' },
      { id: 'legumes-cuits', nom: 'Légumes cuits', avecArticle: 'les légumes cuits' },
      {
        id: 'legumineuses',
        nom: 'Lentilles ou pois chiches cuits',
        avecArticle: 'les lentilles ou pois chiches',
      },
      {
        id: 'aquafaba',
        nom: 'Jus de pois chiches (aquafaba)',
        avecArticle: 'le jus de pois chiches',
      },
      { id: 'poulet-cuit', nom: 'Restes de poulet', avecArticle: 'les restes de poulet' },
      { id: 'jambon', nom: 'Bouts de jambon', avecArticle: 'les bouts de jambon' },
      { id: 'fromage-bouts', nom: 'Bouts de fromage', avecArticle: 'les bouts de fromage' },
      {
        id: 'croute-parmesan',
        nom: 'Croûte de parmesan',
        avecArticle: 'la croûte de parmesan',
      },
      { id: 'yaourt', nom: 'Yaourt à finir', avecArticle: 'le yaourt' },
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
      {
        id: 'bananes-mures',
        nom: 'Bananes trop mûres',
        avecArticle: 'les bananes trop mûres',
      },
      { id: 'fruits-abimes', nom: 'Fruits abîmés', avecArticle: 'les fruits abîmés' },
    ],
  },
  {
    titre: 'Dans mon placard',
    ingredients: [
      { id: 'oeufs', nom: 'Œufs', avecArticle: 'les œufs' },
      { id: 'lait', nom: 'Lait ou crème', avecArticle: 'le lait' },
      { id: 'beurre', nom: 'Beurre', avecArticle: 'le beurre' },
      { id: 'farine', nom: 'Farine', avecArticle: 'la farine' },
      { id: 'levure', nom: 'Levure chimique', avecArticle: 'la levure' },
      { id: 'sucre', nom: 'Sucre', avecArticle: 'le sucre' },
      { id: 'miel', nom: 'Miel', avecArticle: 'le miel' },
      { id: 'oignon', nom: 'Oignon', avecArticle: "l'oignon" },
      { id: 'ail', nom: 'Ail', avecArticle: "l'ail" },
      { id: 'pomme-de-terre', nom: 'Pomme de terre', avecArticle: 'la pomme de terre' },
      { id: 'citron', nom: 'Citron', avecArticle: 'le citron' },
      { id: 'vinaigre', nom: 'Vinaigre', avecArticle: 'le vinaigre' },
      { id: 'moutarde', nom: 'Moutarde', avecArticle: 'la moutarde' },
      { id: 'epices', nom: 'Épices (curry, cumin…)', avecArticle: 'les épices' },
      { id: 'sauce-soja', nom: 'Sauce soja', avecArticle: 'la sauce soja' },
      { id: 'pates-seches', nom: 'Pâtes sèches', avecArticle: 'les pâtes' },
      { id: 'pate', nom: 'Pâte à tarte', avecArticle: 'la pâte à tarte' },
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
