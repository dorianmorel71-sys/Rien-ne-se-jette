import { TestBed } from '@angular/core/testing';
import { Frigo } from './frigo';
import { SelectionRestes } from './selection-restes';

describe('SelectionRestes', () => {
  let selection: SelectionRestes;

  beforeEach(() => {
    TestBed.inject(Frigo).vider();
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

describe('SelectionRestes et le frigo', () => {
  let selection: SelectionRestes;
  let frigo: Frigo;

  beforeEach(() => {
    frigo = TestBed.inject(Frigo);
    frigo.vider();
    selection = TestBed.inject(SelectionRestes);
    selection.repartirDuFrigo();
  });

  it('part du contenu du frigo, sans le congélateur', () => {
    frigo.ranger(['riz-cuit', 'jambon']);
    frigo.ranger(['pain-rassis'], { congele: true });
    expect(selection.origine()).toBe('frigo');
    expect(selection.estCoche('riz-cuit')).toBe(true);
    expect(selection.estCoche('pain-rassis')).toBe(false);
  });

  it('garde le placard quand on change de restes', () => {
    frigo.ranger(['riz-cuit']);
    selection.basculer('oeufs');
    expect(selection.origine()).toBe('frigo');
    selection.basculer('jambon');
    expect(selection.origine()).toBe('manuel');
    expect(selection.estCoche('oeufs')).toBe(true);

    selection.repartirDuFrigo();
    expect(selection.estCoche('jambon')).toBe(false);
    expect(selection.estCoche('oeufs')).toBe(true);
  });
});

describe('SelectionRestes : ordre des recettes', () => {
  it('met en tête les recettes qui sauvent les restes urgents', () => {
    const frigo = TestBed.inject(Frigo);
    frigo.vider();
    frigo.jour.set('2026-10-31');
    // Le riz cuit est à finir aujourd'hui, la croûte de parmesan a un mois devant elle.
    frigo.ranger(['riz-cuit'], { depuis: '2026-10-29' });
    frigo.ranger(['croute-parmesan']);
    const selection = TestBed.inject(SelectionRestes);
    selection.repartirDuFrigo();
    const [premiere] = selection.recettes();
    expect(premiere.ingredients.map((i) => i.id)).toContain('riz-cuit');
  });
});
