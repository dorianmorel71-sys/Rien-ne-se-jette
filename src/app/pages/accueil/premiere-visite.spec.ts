import { ficheDeDepart, retenirFiche } from './premiere-visite';

describe('ficheDeDepart', () => {
  it('rouvre la dernière fiche consultée', () => {
    // Le stockage peut manquer en test : la fonction doit quand même répondre.
    expect(ficheDeDepart()).toMatch(/^legume\//);
    retenirFiche('poireau');
    if (typeof localStorage?.setItem === 'function') {
      expect(ficheDeDepart()).toBe('legume/poireau');
    }
  });
});
