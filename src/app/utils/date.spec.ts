import { ajouterJours, aujourdhui, ecartEnJours, libelleDate } from './date';

describe('Dates', () => {
  it('formate la date du jour', () => {
    expect(aujourdhui(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('compte les jours, changement de mois et d’heure compris', () => {
    expect(ecartEnJours('2026-10-30', '2026-11-02')).toBe(3);
    expect(ecartEnJours('2026-10-24', '2026-10-26')).toBe(2);
    expect(ecartEnJours('2026-10-30', '2026-10-29')).toBe(-1);
    expect(ajouterJours('2026-12-30', 3)).toBe('2027-01-02');
  });

  it('écrit la date en toutes lettres', () => {
    expect(libelleDate('2026-10-30')).toBe('vendredi 30 octobre');
  });
});
