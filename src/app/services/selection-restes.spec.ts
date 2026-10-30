import { TestBed } from '@angular/core/testing';
import { SelectionRestes } from './selection-restes';

describe('SelectionRestes', () => {
  let selection: SelectionRestes;

  beforeEach(() => {
    selection = TestBed.inject(SelectionRestes);
  });

  it("démarre avec la sélection d'exemple", () => {
    expect(selection.estExemple()).toBe(true);
    expect(selection.nombre()).toBe(5);
  });

  it('coche et décoche un reste', () => {
    selection.basculer('pain-rassis');
    expect(selection.estCoche('pain-rassis')).toBe(true);
    expect(selection.estExemple()).toBe(false);

    selection.basculer('pain-rassis');
    expect(selection.estCoche('pain-rassis')).toBe(false);
  });

  it('classe les recettes par nombre de restes utilisés', () => {
    selection.toutDecocher();
    selection.basculer('epl-pomme');
    selection.basculer('zeste');

    const [premiere] = selection.propositions();
    expect(premiere.recette.nom).toBe('Chips de pomme et infusion');
    expect(premiere.restesUtilises.map((r) => r.id)).toEqual(['epl-pomme', 'zeste']);
  });

  it('ne propose rien quand tout est décoché', () => {
    selection.toutDecocher();
    expect(selection.propositions()).toEqual([]);
  });
});
