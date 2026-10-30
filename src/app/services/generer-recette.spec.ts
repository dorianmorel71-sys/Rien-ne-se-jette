import { Ingredient, ModeleRecette } from '../models/recette';
import { enMinutes, enumerer, genererRecette } from './generer-recette';

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
