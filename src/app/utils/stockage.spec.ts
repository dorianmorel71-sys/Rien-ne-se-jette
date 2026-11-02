import { ecrire, garderSurAppareil, lire } from './stockage';

const CLE = 'rien-ne-se-jette.favoris';

/** Stockage en mémoire : celui de l'environnement de test n'est pas utilisable. */
function stockageEnMemoire(): Storage {
  const valeurs = new Map<string, string>();
  return {
    get length() {
      return valeurs.size;
    },
    clear: () => valeurs.clear(),
    getItem: (cle) => valeurs.get(cle) ?? null,
    key: (i) => [...valeurs.keys()][i] ?? null,
    removeItem: (cle) => void valeurs.delete(cle),
    setItem: (cle, valeur) => void valeurs.set(cle, String(valeur)),
  };
}

describe('stockage des données personnelles', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', stockageEnMemoire());
    vi.stubGlobal('sessionStorage', stockageEnMemoire());
  });
  afterEach(() => vi.unstubAllGlobals());

  it('sans compte, les garde seulement le temps de l’onglet', () => {
    ecrire(CLE, ['a']);
    expect(lire(CLE, [])).toEqual(['a']);
    expect(sessionStorage.getItem(CLE)).not.toBeNull();
    expect(localStorage.getItem(CLE)).toBeNull();
  });

  it('les garde sur l’appareil à la connexion, et les y retire à la déconnexion', () => {
    ecrire(CLE, ['b']);
    garderSurAppareil(true);
    expect(localStorage.getItem(CLE)).toBe('["b"]');
    expect(lire(CLE, [])).toEqual(['b']);

    garderSurAppareil(false);
    expect(localStorage.getItem(CLE)).toBeNull();
    expect(lire(CLE, [])).toEqual(['b']);
  });

  it('efface ce qu’une ancienne version avait laissé sur l’appareil', () => {
    localStorage.setItem(CLE, '["vieux"]');
    garderSurAppareil(false);
    expect(localStorage.getItem(CLE)).toBeNull();
  });

  it('garde toujours les réglages sur l’appareil', () => {
    ecrire('rien-ne-se-jette.sonnerie', 'carillon');
    expect(localStorage.getItem('rien-ne-se-jette.sonnerie')).toBe('"carillon"');
  });
});
