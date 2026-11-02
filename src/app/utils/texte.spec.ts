import { normaliser } from './texte';

describe('normaliser', () => {
  it('ignore les accents, les majuscules et le « œ »', () => {
    expect(normaliser('Céleri')).toBe('celeri');
    expect(normaliser('Œufs')).toBe('oeufs');
    expect(normaliser('Côte de bœuf')).toBe('cote de boeuf');
  });
});
