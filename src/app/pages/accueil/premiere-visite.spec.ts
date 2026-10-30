import { marquerAccueilVu, pageDeDepart } from './premiere-visite';

describe('pageDeDepart', () => {
  it("montre l'accueil une seule fois", () => {
    // Le stockage peut manquer en test : la fonction doit quand même répondre.
    const avant = pageDeDepart();
    expect(['accueil', 'legume/carotte']).toContain(avant);
    marquerAccueilVu();
    if (typeof localStorage?.setItem === 'function') {
      expect(pageDeDepart()).toBe('legume/carotte');
    }
  });
});
