import { GROUPE_PLACARD } from './frigo';
import { GROUPES_INGREDIENTS } from './ingredients';
import { CATEGORIES_LEGUMES, LEGUMES } from './legumes';

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

  it('range les restes des Recettes dans les mêmes familles, et le même ordre, que les Aliments', () => {
    expect(GROUPES_INGREDIENTS.map((g) => g.titre)).toEqual([
      ...CATEGORIES_LEGUMES,
      GROUPE_PLACARD,
    ]);
  });

  it('met chaque reste dans la famille de son aliment', () => {
    const famille = new Map(
      GROUPES_INGREDIENTS.flatMap((g) => g.ingredients.map((i) => [i.id, g.titre] as const)),
    );
    const mal = LEGUMES.flatMap((l) =>
      (l.restes ?? [])
        .filter((id) => famille.get(id) !== l.categorie)
        .map(
          (id) => `${id} : dans « ${famille.get(id)} », mais ${l.nom} est dans « ${l.categorie} »`,
        ),
    );
    expect(mal).toEqual([]);
  });
});
