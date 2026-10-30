import { DonneesCompte, fusionner } from './fusion';

const VIDE: DonneesCompte = {
  favoris: { legumes: [], recettes: [] },
  frigo: [],
  compteur: { restes: 0, recettes: 0, fois: {} },
};

describe('fusionner', () => {
  it("garde ce qui vient de l'appareil et du compte, sans doublon", () => {
    const local: DonneesCompte = {
      ...VIDE,
      favoris: { legumes: ['carotte', 'poireau'], recettes: [] },
      frigo: [
        { id: 'riz-cuit', depuis: '2026-10-29' },
        { id: 'jambon', depuis: '2026-10-30' },
      ],
    };
    const compte: DonneesCompte = {
      ...VIDE,
      favoris: { legumes: ['poireau', 'pomme'], recettes: [] },
      frigo: [{ id: 'riz-cuit', depuis: '2026-10-30' }],
    };
    const resultat = fusionner(local, compte);
    expect(resultat.favoris.legumes).toEqual(['poireau', 'pomme', 'carotte']);
    expect(resultat.frigo).toEqual([
      { id: 'riz-cuit', depuis: '2026-10-29' },
      { id: 'jambon', depuis: '2026-10-30' },
    ]);
  });

  it('garde le plus grand compteur', () => {
    const local = { ...VIDE, compteur: { restes: 5, recettes: 2, fois: { Soupe: 2 } } };
    const compte = { ...VIDE, compteur: { restes: 3, recettes: 3, fois: { Soupe: 1, Pesto: 2 } } };
    expect(fusionner(local, compte).compteur).toEqual({
      restes: 5,
      recettes: 3,
      fois: { Soupe: 2, Pesto: 2 },
    });
  });
});
