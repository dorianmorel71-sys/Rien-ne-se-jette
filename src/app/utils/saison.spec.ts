import { libelleSaison } from './saison';

describe('libelleSaison', () => {
  it('décrit les périodes de saison', () => {
    expect(libelleSaison([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])).toBe("Toute l'année");
    expect(libelleSaison([6, 7, 8, 9])).toBe('De juin à septembre');
    expect(libelleSaison([1, 2, 3, 10, 11, 12])).toBe("D'octobre à mars");
    expect(libelleSaison([3, 4, 5, 9, 10, 11])).toBe('De mars à mai et de septembre à novembre');
    expect(libelleSaison([8])).toBe('En août');
  });
});
