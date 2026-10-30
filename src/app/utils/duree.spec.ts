import { dureeDansEtape, formaterDuree } from './duree';

describe('dureeDansEtape', () => {
  it('trouve la durée de cuisson', () => {
    expect(dureeDansEtape('Laisse cuire 25 min, puis mixe et poivre.')).toBe(25);
    expect(dureeDansEtape('Enfourne 12 à 15 min : les bords doivent être dorés.')).toBe(12);
    expect(dureeDansEtape('Laisse 1 h au frais.')).toBe(60);
    expect(dureeDansEtape('Laisse 2 h au frais.')).toBe(120);
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
