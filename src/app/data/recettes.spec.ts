import { GROUPES_INGREDIENTS, INGREDIENTS_EXEMPLE } from './ingredients';
import { MODELES_RECETTES } from './recettes';

const IDS = new Set(GROUPES_INGREDIENTS.flatMap((g) => g.ingredients).map((i) => i.id));

describe('Données des recettes', () => {
  it("n'a pas d'ingrédient en double", () => {
    const tous = GROUPES_INGREDIENTS.flatMap((g) => g.ingredients).map((i) => i.id);
    expect(tous.length).toBe(IDS.size);
  });

  it("n'a pas de recette en double", () => {
    const noms = MODELES_RECETTES.map((m) => m.nom);
    expect(new Set(noms).size).toBe(noms.length);
  });

  it('ne référence que des ingrédients qui existent', () => {
    const inconnus = INGREDIENTS_EXEMPLE.filter((id) => !IDS.has(id));
    for (const m of MODELES_RECETTES) {
      const etapes = m.etapes.flatMap((e) => (typeof e === 'string' ? [] : [e.si, e.sauf]));
      const ids = [...m.requis, ...m.restes, ...m.optionnels, ...etapes, m.avertissement?.si];
      inconnus.push(
        ...ids.filter((id): id is string => !!id && !IDS.has(id)).map((id) => `${m.nom} : ${id}`),
      );
    }
    expect(inconnus).toEqual([]);
  });

  it('ne conditionne une étape que sur un ingrédient utilisé par la recette', () => {
    const erreurs: string[] = [];
    for (const m of MODELES_RECETTES) {
      const utilises = new Set([...m.requis, ...m.restes, ...m.optionnels]);
      for (const e of m.etapes) {
        if (typeof e === 'string') continue;
        for (const id of [e.si, e.sauf]) {
          if (id && !utilises.has(id)) erreurs.push(`${m.nom} : ${id}`);
        }
      }
    }
    expect(erreurs).toEqual([]);
  });

  it('ne met {restes} que dans les recettes qui ont des restes', () => {
    const erreurs = MODELES_RECETTES.filter(
      (m) =>
        m.restes.length === 0 &&
        m.etapes.some((e) => (typeof e === 'string' ? e : e.texte).includes('{restes}')),
    ).map((m) => m.nom);
    expect(erreurs).toEqual([]);
  });
});
