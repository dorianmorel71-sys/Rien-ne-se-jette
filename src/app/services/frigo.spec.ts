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

describe('Frigo : dates, congélateur et restes libres', () => {
  let frigo: Frigo;

  beforeEach(() => {
    frigo = TestBed.inject(Frigo);
    frigo.vider();
    frigo.jour.set('2026-10-30');
  });

  it('compte à partir du jour où le reste a vraiment été rangé', () => {
    frigo.ranger(['jambon'], { depuis: '2026-10-28' });
    expect(frigo.restes()[0].joursRestants).toBe(1);
    frigo.modifier('jambon', { depuis: '2026-10-25' });
    expect(frigo.restes()[0].joursRestants).toBe(-2);
  });

  it('garde 3 mois au congélateur, puis 24 h une fois sorti', () => {
    frigo.ranger(['riz-cuit'], { depuis: '2026-10-20' });
    frigo.congeler('riz-cuit');
    expect(frigo.auCongelateur()[0].limite).toBe('2027-01-28');
    expect(frigo.urgents()).toBe(0);

    frigo.decongeler('riz-cuit');
    expect(frigo.auFrigo()[0].joursRestants).toBe(1);
    expect(frigo.urgents()).toBe(1);
  });

  it('accepte un reste écrit à la main, avec une note', () => {
    frigo.rangerLibre(' Moitié de courgette ');
    const [reste] = frigo.restes();
    frigo.modifier(reste.id, { note: 'pour dimanche' });
    expect(frigo.restes()[0]).toMatchObject({
      libre: true,
      note: 'pour dimanche',
      ingredient: { nom: 'Moitié de courgette' },
    });
  });
});
