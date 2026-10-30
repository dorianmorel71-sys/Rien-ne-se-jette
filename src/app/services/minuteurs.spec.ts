import { TestBed } from '@angular/core/testing';
import { Minuteurs } from './minuteurs';

describe('Minuteurs', () => {
  let minuteurs: Minuteurs;
  let maintenant: number;

  beforeEach(() => {
    maintenant = 1_000_000;
    vi.spyOn(Date, 'now').mockImplementation(() => maintenant);
    minuteurs = TestBed.inject(Minuteurs);
    minuteurs.liste.set([]);
  });

  afterEach(() => vi.restoreAllMocks());

  it('décompte, se met en pause et reprend là où il en était', () => {
    minuteurs.lancer('Pâtes', 10);
    const [m] = minuteurs.liste();
    maintenant += 4 * 60_000;
    minuteurs.actualiser(maintenant);
    expect(minuteurs.restant(minuteurs.liste()[0])).toBe(6 * 60_000);

    minuteurs.pause(m.id);
    maintenant += 30 * 60_000;
    minuteurs.actualiser(maintenant);
    expect(minuteurs.restant(minuteurs.liste()[0])).toBe(6 * 60_000);

    minuteurs.reprendre(m.id);
    minuteurs.ajouter(m.id, 1);
    maintenant += 60_000;
    minuteurs.actualiser(maintenant);
    expect(minuteurs.restant(minuteurs.liste()[0])).toBe(6 * 60_000);
  });

  it("sonne à la fin jusqu'à ce qu'on l'arrête", () => {
    minuteurs.lancer('Étape 2', 1);
    maintenant += 61_000;
    minuteurs.actualiser(maintenant);
    expect(minuteurs.sonnerie()).toBe(true);

    minuteurs.arreterSonnerie();
    expect(minuteurs.liste()).toEqual([]);
  });

  it('relance un minuteur qui sonne quand on ajoute une minute', () => {
    minuteurs.lancer('Riz', 1);
    maintenant += 60_000;
    minuteurs.actualiser(maintenant);
    minuteurs.ajouter(minuteurs.liste()[0].id, 1);
    expect(minuteurs.sonnerie()).toBe(false);
    expect(minuteurs.restant(minuteurs.liste()[0])).toBe(60_000);
  });
});
