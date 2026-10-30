/** Une astuce anti-gaspi par jour, dans l'ordre de l'année. */
export const ASTUCES: string[] = [
  'Garde un sac au congélateur pour les épluchures : quand il est plein, fais un bouillon.',
  "Les pelures d'oignon donnent une belle couleur dorée aux bouillons.",
  'Une salade fanée retrouve du croquant après 20 min dans de l’eau glacée.',
  'Le pain rassis se râpe en chapelure : elle se garde des semaines dans un bocal.',
  'La croûte du parmesan parfume une soupe : retire-la avant de servir.',
  'Des bananes noires font le meilleur gâteau : plus elles sont mûres, plus il est sucré.',
  'Coupe les fanes des carottes et des radis dès l’achat : les légumes restent fermes plus longtemps.',
  'Le jus des pois chiches se monte en neige comme des blancs d’œufs.',
  'Les tiges d’herbes ont autant de goût que les feuilles : mixe-les dans un pesto.',
  'Range les produits les plus anciens devant dans le frigo, et les nouveaux derrière.',
  '« À consommer de préférence avant » n’est pas une date limite : sens et goûte avant de jeter.',
  'Le riz cuit se garde 2 jours au frigo, bien couvert. Après, il va au compost.',
  'Râpe et congèle le zeste des agrumes bio avant de presser le jus.',
  'Un légume un peu mou est parfait pour une soupe ou un gratin.',
  'Les fanes de radis font une soupe verte délicieuse avec une pomme de terre.',
  'Le tronc du brocoli, épluché, est aussi tendre que les fleurettes.',
  'Les graines de courge grillées font un apéro croustillant en 20 min.',
  'Congèle les herbes fraîches hachées dans l’huile, en bac à glaçons.',
  'Le vert du poireau a plus de goût que le blanc : il faut juste le cuire plus longtemps.',
  'Un fond de yaourt suffit pour faire une sauce à salade crémeuse.',
  'Les épluchures de pomme et de poire font une infusion avec un bâton de cannelle.',
  'Prévois un repas « fond de frigo » par semaine : omelette, riz sauté ou quiche.',
  'Les fruits abîmés se congèlent en morceaux pour les smoothies.',
  'Les champignons se gardent dans un sac en papier, jamais dans le plastique.',
  'Le pain perdu, salé ou sucré, sauve tout le pain de la semaine.',
  'Les feuilles de chou-fleur rôties au four ont un goût de chips de chou kale.',
  'Fais ta liste de courses après avoir regardé ton frigo, pas avant.',
  'L’écorce d’ananas fait une boisson pétillante maison : le tepache.',
  'Les peaux de tomate séchées et mixées font une poudre pour assaisonner.',
  'Les restes de purée se transforment en croquettes dorées.',
  'Cuisine les légumes de saison : ils sont meilleurs et se gardent plus longtemps.',
];

/** Astuce du jour : la même toute la journée, une autre le lendemain. */
export function astuceDuJour(date = new Date()): string {
  const debutAnnee = new Date(date.getFullYear(), 0, 0);
  const jour = Math.floor((date.getTime() - debutAnnee.getTime()) / 86_400_000);
  return ASTUCES[jour % ASTUCES.length];
}
