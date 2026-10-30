import { TestBed } from '@angular/core/testing';
import { Frigo } from './frigo';

describe('Frigo', () => {
  let frigo: Frigo;

  beforeEach(() => {
    frigo = TestBed.inject(Frigo);
    frigo.vider();
    frigo.jour.set('2026-10-30');
  });

  it('range les restes sans le placard ni les doublons', () => {
    frigo.ranger(['riz-cuit', 'oeufs', 'riz-cuit']);
    expect(frigo.restes().map((r) => r.ingredient.id)).toEqual(['riz-cuit']);
  });

  it('trie par urgence et compte les restes à finir vite', () => {
    frigo.ranger(['croute-parmesan', 'avocat-mur', 'riz-cuit']);
    expect(frigo.restes().map((r) => r.ingredient.id)).toEqual([
      'avocat-mur',
      'riz-cuit',
      'croute-parmesan',
    ]);
    expect(frigo.urgents()).toBe(1);

    frigo.jour.set('2026-11-01');
    expect(frigo.restes()[0].joursRestants).toBe(-1);
    expect(frigo.urgents()).toBe(2);
  });

  it('retire les restes utilisés', () => {
    frigo.ranger(['riz-cuit', 'jambon']);
    frigo.retirer(['riz-cuit']);
    expect(frigo.nombre()).toBe(1);
  });
});
