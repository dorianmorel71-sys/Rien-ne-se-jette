import { ResteAuFrigo } from './frigo';
import { suggererRecettes } from './suggestions';

function reste(id: string, nom: string, joursRestants: number, autres: Partial<ResteAuFrigo> = {}) {
  return {
    id,
    ingredient: { id, nom, avecArticle: nom },
    depuis: '2026-10-30',
    congele: false,
    decongele: false,
    libre: false,
    limite: '2026-10-30',
    joursRestants,
    conseils: [],
    ...autres,
  } satisfies ResteAuFrigo;
}

describe('suggererRecettes', () => {
  it('met en avant les recettes qui sauvent les restes urgents', () => {
    const suggestions = suggererRecettes([
      reste('riz-cuit', 'Riz cuit', 0),
      reste('croute-parmesan', 'Croûte de parmesan', 25),
    ]);
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0].sauves[0].id).toBe('riz-cuit');
  });

  it('indique le placard indispensable', () => {
    const [premiere] = suggererRecettes([reste('pates-cuites', 'Pâtes cuites', 0)], 10).filter(
      (s) => s.recette.nom === 'Frittata de pâtes',
    );
    expect(premiere.placard.map((i) => i.id)).toEqual(['oeufs']);
  });

  it('ignore le congélateur et les restes écrits à la main', () => {
    expect(
      suggererRecettes([
        reste('riz-cuit', 'Riz cuit', 80, { congele: true }),
        reste('libre-x', 'Moitié de courgette', 1, { libre: true }),
      ]),
    ).toEqual([]);
  });
});
