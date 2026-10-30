import { TestBed } from '@angular/core/testing';
import { SelectionRestes } from './selection-restes';

describe('SelectionRestes', () => {
  let selection: SelectionRestes;

  beforeEach(() => {
    selection = TestBed.inject(SelectionRestes);
  });

  function cocher(...ids: string[]): void {
    selection.toutDecocher();
    ids.forEach((id) => selection.basculer(id));
  }

  it("démarre avec la sélection d'exemple", () => {
    expect(selection.estExemple()).toBe(true);
    expect(selection.nombre()).toBe(5);
  });

  it('coche et décoche un ingrédient', () => {
    selection.basculer('pain-rassis');
    expect(selection.estCoche('pain-rassis')).toBe(true);
    expect(selection.estExemple()).toBe(false);

    selection.basculer('pain-rassis');
    expect(selection.estCoche('pain-rassis')).toBe(false);
  });

  it('ne propose que des recettes faites avec ce qui est coché', () => {
    cocher('fanes-carotte', 'vert-poireau', 'riz-cuit', 'fromage-bouts');

    const recettes = selection.recettes();
    expect(recettes.length).toBeGreaterThan(0);
    for (const recette of recettes) {
      for (const ingredient of recette.ingredients) {
        expect(selection.estCoche(ingredient.id)).toBe(true);
      }
    }
  });

  it("ne propose pas de recette dont un ingrédient requis n'est pas coché", () => {
    cocher('vert-poireau');
    const noms = selection.recettes().map((r) => r.nom);
    expect(noms).not.toContain('Omelette fond de frigo');
    expect(noms).not.toContain('Gratin des restes');

    selection.basculer('oeufs');
    expect(selection.recettes().map((r) => r.nom)).toContain('Omelette fond de frigo');
  });

  it('ne propose rien quand tout est décoché', () => {
    selection.toutDecocher();
    expect(selection.recettes()).toEqual([]);
  });

  it("remplace l'exemple par les restes ajoutés depuis une fiche", () => {
    selection.ajouter(['fanes-radis']);
    expect(selection.nombre()).toBe(1);
    selection.ajouter(['vert-poireau']);
    expect(selection.estCoche('fanes-radis')).toBe(true);
    expect(selection.nombre()).toBe(2);
  });
});
