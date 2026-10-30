import { dureeDansEtape, dureesDans, formaterDuree, libelleMinutes } from './duree';

describe('dureeDansEtape', () => {
  it('trouve la durée de cuisson', () => {
    expect(dureeDansEtape('Laisse cuire 25 min, puis mixe et poivre.')).toBe(25);
    expect(dureeDansEtape('Enfourne 12 à 15 min : les bords doivent être dorés.')).toBe(12);
    expect(dureeDansEtape('Laisse 1 h au frais.')).toBe(60);
    expect(dureeDansEtape('Laisse 2 h au frais.')).toBe(120);
  });

  it('lit les heures et les minutes ensemble', () => {
    expect(dureeDansEtape('Enfourne 1 h 30 et laisse refroidir dans le four éteint.')).toBe(90);
    expect(dureeDansEtape('Cuis 1h15 à feu doux.')).toBe(75);
    expect(dureeDansEtape('Laisse mijoter 2 h 10 min.')).toBe(130);
    expect(dureeDansEtape('Laisse 1 h au frais, puis 30 min dehors.')).toBe(60);
  });

  it('ignore les étapes sans durée et les attentes en jours', () => {
    expect(dureeDansEtape('Sale et poivre.')).toBeNull();
    expect(dureeDansEtape('Laisse fermenter 2 jours.')).toBeNull();
    expect(dureeDansEtape('Préchauffe le four à 200 °C.')).toBeNull();
  });
});

describe('formaterDuree', () => {
  it('écrit minutes et secondes, puis les heures', () => {
    expect(formaterDuree(95_000)).toBe('1:35');
    expect(formaterDuree(400)).toBe('0:01');
    expect(formaterDuree(0)).toBe('0:00');
    expect(formaterDuree(3_900_000)).toBe('1:05:00');
  });
});

describe('dureesDans', () => {
  it('additionne correctement les temps des recettes', () => {
    const total = (t: string) => dureesDans(t).reduce((a, b) => a + b, 0);
    expect(total('15 min + 1 h 30 au four')).toBe(105);
    expect(total('1 h 15')).toBe(75);
    expect(total('10 min + 1 h au frais')).toBe(70);
    expect(total('20 min + 24 h au frigo')).toBe(20 + 1440);
    expect(total('10 min + 25 min au four')).toBe(35);
  });
});

describe('libelleMinutes', () => {
  it('écrit les durées comme dans les recettes', () => {
    expect(libelleMinutes(25)).toBe('25 min');
    expect(libelleMinutes(60)).toBe('1 h');
    expect(libelleMinutes(90)).toBe('1 h 30');
    expect(libelleMinutes(125)).toBe('2 h 05');
  });
});
