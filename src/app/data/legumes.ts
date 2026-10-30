import { Legume } from '../models/legume';

export const LEGUMES: Legume[] = [
  {
    id: 'carotte',
    nom: 'Carotte',
    couleur: '#e07a1f',
    score: '3 parties sur 3',
    intro: 'Presque tout se mange dans la carotte, y compris les fanes.',
    parties: [
      {
        nom: 'Fanes',
        usages: [
          '<b>Pesto</b> : mixées avec ail, huile, parmesan et noix',
          'Hachées dans un taboulé ou une omelette',
          'Dans une soupe, comme du persil',
        ],
      },
      {
        nom: 'Épluchures',
        usages: [
          '<b>Chips</b> au four : huile, sel, 15 min à 180 °C',
          'Dans un bouillon de légumes maison',
        ],
      },
      { nom: 'Bout du dessus', usages: ["Posé dans une coupelle d'eau, il refait des fanes"] },
    ],
  },
  {
    id: 'poireau',
    nom: 'Poireau',
    couleur: '#5c9a3c',
    score: '3 parties sur 3',
    intro: 'Le vert du poireau a plus de goût que le blanc, il faut juste le cuire plus longtemps.',
    parties: [
      {
        nom: 'Vert',
        usages: [
          '<b>Fondue de poireaux</b> : émincé fin, cuit doucement au beurre 20 min',
          'Dans une soupe ou une quiche',
          'Coupé en lanières pour un bouillon',
        ],
      },
      {
        nom: 'Racines',
        usages: ['Bien lavées, frites en <b>tempura</b> ou à la poêle : très croustillant'],
      },
      { nom: 'Feuilles abîmées', usages: ['Dans le bouillon, puis au compost'] },
    ],
  },
  {
    id: 'brocoli',
    nom: 'Brocoli',
    couleur: '#2f7d4f',
    score: '3 parties sur 3',
    intro: "Le tronc est souvent jeté alors qu'il est tendre une fois épluché.",
    parties: [
      {
        nom: 'Tronc',
        usages: [
          'Épluché et coupé en bâtonnets : <b>sauté à la poêle</b> ou en wok',
          'Râpé cru en salade, comme du chou-rave',
          'Mixé dans une soupe ou un velouté',
        ],
      },
      { nom: 'Feuilles', usages: ['Cuites comme des épinards, ou en chips au four'] },
      { nom: 'Peau du tronc', usages: ['Dans le bouillon de légumes'] },
    ],
  },
  {
    id: 'chou-fleur',
    nom: 'Chou-fleur',
    couleur: '#c9b98a',
    score: '3 parties sur 3',
    intro: 'Les feuilles vertes rôties au four ont un goût proche des chips de chou kale.',
    parties: [
      {
        nom: 'Feuilles',
        usages: [
          '<b>Rôties</b> au four avec huile et sel, 15 min à 200 °C',
          'Dans une soupe ou un gratin',
        ],
      },
      { nom: 'Trognon', usages: ['Coupé fin et cuit avec le reste', 'Râpé cru en salade'] },
      {
        nom: 'Miettes',
        usages: ['Les petits bouts qui tombent : en « riz » de chou-fleur à la poêle'],
      },
    ],
  },
  {
    id: 'courgette',
    nom: 'Courgette',
    couleur: '#4f8a2a',
    score: '2 parties sur 2',
    intro: "La peau se mange déjà, mais si la recette demande de l'éplucher, garde-la.",
    parties: [
      {
        nom: 'Épluchures',
        usages: [
          "<b>Pesto</b> d'épluchures",
          "Tagliatelles de peau sautées à l'ail",
          'Dans une omelette ou un cake salé',
        ],
      },
      {
        nom: 'Cœur à graines',
        usages: ['Sur les grosses courgettes : dans une soupe ou un velouté'],
      },
    ],
  },
  {
    id: 'courge',
    nom: 'Courge / potimarron',
    couleur: '#d9631e',
    score: '3 parties sur 3',
    intro: "Les graines grillées font un snack parfait pour l'apéro.",
    parties: [
      {
        nom: 'Graines',
        usages: [
          '<b>Grillées</b> : rincées, séchées, huile et sel, 15–20 min à 170 °C',
          'En topping sur une soupe ou une salade',
        ],
      },
      {
        nom: 'Peau',
        usages: [
          "Potimarron : la peau se mange, ne l'épluche pas",
          'Butternut : la peau se mange rôtie au four',
        ],
      },
      { nom: 'Filaments', usages: ['Dans le bouillon ou la soupe'] },
    ],
    avertissement: 'Une courge au goût très amer ne se mange pas, même cuite. Jette-la entière.',
  },
  {
    id: 'pomme-de-terre',
    nom: 'Pomme de terre',
    couleur: '#b58a4c',
    score: '1 partie',
    intro: 'Les épluchures font de vraies chips, à condition de bien les choisir.',
    parties: [
      {
        nom: 'Épluchures',
        usages: [
          '<b>Chips</b> au four : huile, sel, paprika, 15 min à 200 °C',
          'À la friteuse à air, 8–10 min',
        ],
      },
      {
        nom: 'Eau de cuisson',
        usages: ['Pour arroser les plantes une fois refroidie (sans sel)'],
      },
    ],
    avertissement: 'Ne mange jamais les parties vertes ni les germes : retire-les et jette-les.',
  },
  {
    id: 'oignon',
    nom: 'Oignon & ail',
    couleur: '#a8743f',
    score: '2 parties',
    intro: 'Les pelures donnent du goût et une belle couleur dorée aux bouillons.',
    parties: [
      {
        nom: 'Pelures',
        usages: [
          'Dans un <b>bouillon</b> : couleur et goût, puis retire-les',
          'Pour teindre des œufs de Pâques',
        ],
      },
      {
        nom: 'Tiges vertes',
        usages: ["Si l'oignon ou l'ail a germé : les pousses se mangent comme de la ciboulette"],
      },
    ],
  },
  {
    id: 'betterave',
    nom: 'Betterave',
    couleur: '#8e1f45',
    score: '3 parties sur 3',
    intro: 'Les feuilles de betterave se cuisinent comme des blettes.',
    parties: [
      {
        nom: 'Feuilles',
        usages: ["<b>Sautées</b> à l'ail comme des épinards", 'En gratin ou dans une quiche'],
      },
      {
        nom: 'Tiges',
        usages: ['Coupées en tronçons et sautées, ou en pickles au vinaigre'],
      },
      { nom: 'Peau', usages: ['Chips au four, ou dans le bouillon pour la couleur'] },
    ],
  },
  {
    id: 'radis',
    nom: 'Radis',
    couleur: '#d0315a',
    score: '2 parties sur 2',
    intro: 'Les fanes de radis font une soupe vraiment bonne.',
    parties: [
      {
        nom: 'Fanes',
        usages: [
          '<b>Soupe de fanes</b> : avec une pomme de terre, mixée',
          'Pesto, ou hachées dans une omelette',
        ],
      },
      {
        nom: 'Radis ramollis',
        usages: [
          "5 min dans l'eau glacée, ils redeviennent croquants",
          'Rôtis au four ou poêlés au beurre',
        ],
      },
    ],
  },
  {
    id: 'celeri',
    nom: 'Céleri',
    couleur: '#7fae4d',
    score: '3 parties',
    intro: "Les feuilles de céleri s'utilisent comme une herbe aromatique.",
    parties: [
      {
        nom: 'Feuilles',
        usages: [
          'Hachées comme du <b>persil</b>',
          'Séchées au four doux pour faire un sel au céleri',
        ],
      },
      { nom: 'Base et bouts', usages: ['Dans le bouillon de légumes'] },
      { nom: 'Épluchures (céleri-rave)', usages: ['Chips au four, ou dans le bouillon'] },
    ],
  },
  {
    id: 'fenouil',
    nom: 'Fenouil',
    couleur: '#9cc26a',
    score: '2 parties',
    intro: 'Les petites feuilles vertes ont un goût anisé très fin.',
    parties: [
      {
        nom: 'Plumet vert',
        usages: ['Haché sur un poisson, une salade ou des pâtes', 'Dans une vinaigrette'],
      },
      { nom: 'Tiges', usages: ['Dans le bouillon ou une soupe de poisson'] },
    ],
  },
  {
    id: 'petits-pois',
    nom: 'Petits pois',
    couleur: '#6fae3a',
    score: '1 partie',
    intro: 'Les cosses donnent un velouté doux et bien vert.',
    parties: [
      {
        nom: 'Cosses',
        usages: [
          '<b>Velouté de cosses</b> : cuites 20 min avec un oignon, mixées puis passées au chinois',
        ],
      },
    ],
    avertissement:
      "Retire la membrane dure à l'intérieur ou passe le velouté au tamis : elle est trop fibreuse.",
  },
  {
    id: 'asperge',
    nom: 'Asperge',
    couleur: '#8aa04a',
    score: '2 parties',
    intro: 'Les bouts durs et les épluchures parfument une soupe.',
    parties: [
      { nom: 'Talons durs', usages: ['<b>Velouté</b> : cuits longtemps, mixés et filtrés'] },
      {
        nom: 'Épluchures',
        usages: ["Dans l'eau de cuisson des asperges, pour plus de goût"],
      },
    ],
  },
  {
    id: 'herbes',
    nom: 'Herbes fraîches',
    couleur: '#3b8f5a',
    score: '2 parties',
    intro: 'Persil, coriandre, basilic : les tiges ont autant de goût que les feuilles.',
    parties: [
      {
        nom: 'Tiges',
        usages: ['Mixées dans un <b>pesto</b> ou une sauce verte', 'Dans le bouillon ou une soupe'],
      },
      {
        nom: 'Herbes fanées',
        usages: ["Mixées avec de l'huile et congelées en bac à glaçons"],
      },
    ],
  },
  {
    id: 'pomme',
    nom: 'Pomme',
    couleur: '#c33b2d',
    score: '2 parties',
    intro: 'Les épluchures et les trognons font une gelée sans acheter de fruits en plus.',
    parties: [
      {
        nom: 'Épluchures',
        usages: [
          '<b>Chips sucrées</b> : cannelle, 1 h à 100 °C',
          'Infusion avec un bâton de cannelle',
        ],
      },
      {
        nom: 'Trognons',
        usages: [
          'Avec les épluchures : <b>gelée de pomme</b> (cuire, filtrer, sucre)',
          'Vinaigre de pomme maison',
        ],
      },
    ],
    avertissement: 'Ne mange pas les pépins : retire-les avant de mixer.',
  },
  {
    id: 'agrumes',
    nom: 'Citron & orange',
    couleur: '#e3a417',
    score: '2 parties',
    intro: 'Le zeste est la partie la plus parfumée du fruit.',
    parties: [
      {
        nom: 'Zeste',
        usages: [
          'Râpé et <b>congelé</b> pour les gâteaux et les sauces',
          'Sel ou sucre aromatisé au zeste',
        ],
      },
      { nom: 'Écorces', usages: ['Confites au sucre', 'Séchées pour une infusion'] },
    ],
    avertissement: 'Prends des agrumes bio ou non traités après récolte pour utiliser la peau.',
  },
  {
    id: 'tomate',
    nom: 'Tomate',
    couleur: '#d8402c',
    score: '2 parties',
    intro: 'Les peaux et les graines retirées pour une sauce peuvent encore servir.',
    parties: [
      {
        nom: 'Peaux',
        usages: ['Séchées au four doux puis mixées : <b>poudre de tomate</b> pour assaisonner'],
      },
      { nom: 'Graines et jus', usages: ['Dans une vinaigrette ou un gaspacho'] },
    ],
    avertissement: 'Les feuilles et les tiges du plant de tomate ne se mangent pas.',
  },
];
