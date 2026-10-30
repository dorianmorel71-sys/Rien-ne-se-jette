import { TestBed } from '@angular/core/testing';
import { RecetteGeneree } from '../models/recette';
import { Favoris } from './favoris';

const RECETTE: RecetteGeneree = {
  nom: 'Soupe test',
  temps: '10 min',
  type: 'salé',
  minutes: 10,
  four: false,
  vegetarien: true,
  ingredients: [],
  etapes: [],
};

describe('Favoris', () => {
  let favoris: Favoris;

  beforeEach(() => {
    favoris = TestBed.inject(Favoris);
  });

  it('ajoute puis retire un légume', () => {
    favoris.basculerLegume('carotte');
    expect(favoris.estLegumeFavori('carotte')).toBe(true);
    favoris.basculerLegume('carotte');
    expect(favoris.estLegumeFavori('carotte')).toBe(false);
  });

  it('ajoute puis retire une recette', () => {
    favoris.basculerRecette(RECETTE);
    expect(favoris.estRecetteFavorite('Soupe test')).toBe(true);
    expect(favoris.nombre()).toBe(1);
    favoris.basculerRecette(RECETTE);
    expect(favoris.nombre()).toBe(0);
  });
});
