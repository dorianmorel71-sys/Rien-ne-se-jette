import { GROUPES_INGREDIENTS } from './ingredients';
import { LEGUMES } from './legumes';

describe('Données des légumes', () => {
  it("n'a pas de légume en double", () => {
    const ids = LEGUMES.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('ne relie un légume qu’à des restes qui existent', () => {
    const ids = new Set(GROUPES_INGREDIENTS.flatMap((g) => g.ingredients).map((i) => i.id));
    const inconnus = LEGUMES.flatMap((l) =>
      (l.restes ?? []).map((id) => `${l.nom} : ${id}`),
    ).filter((texte) => !ids.has(texte.split(' : ')[1]));
    expect(inconnus).toEqual([]);
  });
});
