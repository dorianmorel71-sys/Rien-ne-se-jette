import { Ingredient, ModeleRecette } from '../models/recette';
import { accord, enMinutes, enumerer, genererRecette, nomDeTete } from './generer-recette';
import { GROUPES_INGREDIENTS } from '../data/ingredients';

const INGREDIENTS = new Map<string, Ingredient>(
  [
    { id: 'a', nom: 'A', avecArticle: 'le a' },
    { id: 'b', nom: 'B', avecArticle: 'le b' },
    { id: 'oeufs', nom: 'Œufs', avecArticle: 'les œufs' },
    { id: 'lait', nom: 'Lait', avecArticle: 'le lait' },
  ].map((i) => [i.id, i]),
);

const MODELE: ModeleRecette = {
  nom: 'Test',
  emoji: '🍳',
  temps: '5 min',
  requis: ['oeufs'],
  restes: ['a', 'b'],
  optionnels: ['lait'],
  etapes: [
    '{restes} dans la poêle.',
    { si: 'lait', texte: 'Ajoute le lait.' },
    { sauf: 'lait', texte: 'Ajoute de l’eau.' },
  ],
};

describe('enumerer', () => {
  it('relie les éléments avec des virgules et « et »', () => {
    expect(enumerer(['a'])).toBe('a');
    expect(enumerer(['a', 'b'])).toBe('a et b');
    expect(enumerer(['a', 'b', 'c'])).toBe('a, b et c');
  });
});

describe('genererRecette', () => {
  it('renvoie null si un ingrédient requis manque', () => {
    expect(genererRecette(MODELE, new Set(['a']), INGREDIENTS)).toBeNull();
  });

  it("renvoie null s'il n'y a aucun reste", () => {
    expect(genererRecette(MODELE, new Set(['oeufs']), INGREDIENTS)).toBeNull();
  });

  it('insère seulement les restes cochés et choisit les étapes selon ce qui est coché', () => {
    const recette = genererRecette(MODELE, new Set(['oeufs', 'a']), INGREDIENTS);
    expect(recette?.ingredients.map((i) => i.id)).toEqual(['oeufs', 'a']);
    expect(recette?.etapes).toEqual(['Le a dans la poêle.', 'Ajoute de l’eau.']);
  });

  it('utilise les optionnels cochés', () => {
    const recette = genererRecette(MODELE, new Set(['oeufs', 'a', 'b', 'lait']), INGREDIENTS);
    expect(recette?.ingredients.map((i) => i.id)).toEqual(['oeufs', 'a', 'b', 'lait']);
    expect(recette?.etapes).toEqual(['Le a et le b dans la poêle.', 'Ajoute le lait.']);
  });

  it('masque les étapes {restes} quand aucun reste n’est nécessaire ni coché', () => {
    const recette = genererRecette({ ...MODELE, minRestes: 0 }, new Set(['oeufs']), INGREDIENTS);
    expect(recette?.etapes).toEqual(['Ajoute de l’eau.']);
  });
});

describe('enMinutes', () => {
  it('additionne les durées, attente comprise', () => {
    expect(enMinutes('15 min')).toBe(15);
    expect(enMinutes('10 min + 1 h au four')).toBe(70);
    expect(enMinutes('15 min + 24 h au frigo')).toBe(15 + 24 * 60);
    expect(enMinutes('10 min + 2 à 3 jours')).toBe(10 + 3 * 1440);
  });
});

describe('accord des étapes', () => {
  const restes = new Map<string, Ingredient>(
    [
      { id: 'poireau', nom: 'Vert de poireau', avecArticle: 'le vert de poireau' },
      { id: 'fanes', nom: 'Fanes', avecArticle: 'les fanes de radis' },
      { id: 'courgette', nom: 'Courgette', avecArticle: 'la courgette' },
    ].map((i) => [i.id, i]),
  );
  const modele: ModeleRecette = {
    nom: 'Test',
    emoji: '🍳',
    temps: '5 min',
    requis: [],
    restes: ['poireau', 'fanes', 'courgette'],
    optionnels: [],
    etapes: [
      'Ajoute {restes} coupés.',
      'Lave {restes} et mets-les dans un bol.',
      'Retourne-les.',
      'Pèse-{les} et ajoute {leur} poids en sucre.',
    ],
  };
  const etapes = (...ids: string[]) =>
    genererRecette(modele, new Set(ids), restes)?.etapes.slice(0, 2);

  it('accorde avec un seul reste, au masculin ou au féminin', () => {
    expect(etapes('poireau')).toEqual([
      'Ajoute le vert de poireau coupé.',
      'Lave le vert de poireau et mets-le dans un bol.',
    ]);
    expect(etapes('courgette')).toEqual([
      'Ajoute la courgette coupée.',
      'Lave la courgette et mets-la dans un bol.',
    ]);
  });

  it('accorde au pluriel, féminin seulement si tous les restes le sont', () => {
    expect(etapes('fanes')?.[0]).toBe('Ajoute les fanes de radis coupées.');
    expect(etapes('fanes', 'courgette')?.[0]).toBe(
      'Ajoute les fanes de radis et la courgette coupées.',
    );
    expect(etapes('poireau', 'fanes')?.[0]).toBe(
      'Ajoute le vert de poireau et les fanes de radis coupés.',
    );
  });

  it('accorde {les} et {leur} dans les étapes suivantes', () => {
    expect(genererRecette(modele, new Set(['courgette']), restes)?.etapes[3]).toBe(
      'Pèse-la et ajoute son poids en sucre.',
    );
    expect(genererRecette(modele, new Set(['fanes']), restes)?.etapes[3]).toBe(
      'Pèse-les et ajoute leur poids en sucre.',
    );
  });

  it('ne touche pas aux étapes sans {restes}', () => {
    expect(genererRecette(modele, new Set(['poireau']), restes)?.etapes[2]).toBe('Retourne-les.');
  });

  it('connaît le genre de chaque reste au pluriel ou avec « l’ »', () => {
    const MASCULINS = new Set([
      'restes',
      'fruits',
      'bouts',
      'légumes',
      'talons',
      'raisins',
      'pieds',
      'os',
      'œufs',
      'lardons',
      'kakis',
      'jaunes',
      'blancs',
      'filaments',
      'épis',
      'épinards',
      'champignons',
      'avocat',
      'oignon',
      'ail',
      'écorce',
    ]);
    const inconnus = GROUPES_INGREDIENTS.flatMap((g) => g.ingredients)
      .filter((i) => /^(les |l')/.test(i.avecArticle))
      .filter((i) => !accord([i]).feminin && !MASCULINS.has(nomDeTete(i.avecArticle)))
      .map((i) => i.avecArticle);
    expect(inconnus).toEqual([]);
  });
});
