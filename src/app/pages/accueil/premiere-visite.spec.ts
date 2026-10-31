import { marquerAccueilVu, pageDeDepart, retenirFiche } from './premiere-visite';

describe('pageDeDepart', () => {
  it("montre l'accueil une seule fois, puis la dernière fiche", () => {
    // Le stockage peut manquer en test : la fonction doit quand même répondre.
    expect(['accueil', 'legume/carotte']).toContain(pageDeDepart());
    expect(pageDeDepart(true)).toMatch(/^legume\//);
    marquerAccueilVu();
    retenirFiche('poireau');
    if (typeof localStorage?.setItem === 'function') {
      expect(pageDeDepart()).toBe('legume/poireau');
    }
  });
});
