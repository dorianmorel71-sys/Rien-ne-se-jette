import { TestBed } from '@angular/core/testing';
import { RecetteGeneree } from '../models/recette';
import { Compteur } from './compteur';

const RECETTE: RecetteGeneree = {
  nom: 'Omelette test',
  temps: '10 min',
  type: 'salé',
  minutes: 10,
  four: false,
  vegetarien: true,
  ingredients: [
    { id: 'fanes-radis', nom: 'Fanes de radis', avecArticle: 'les fanes de radis' },
    { id: 'oeufs', nom: 'Œufs', avecArticle: 'les œufs' },
  ],
  etapes: [],
};

describe('Compteur', () => {
  let compteur: Compteur;

  beforeEach(() => {
    compteur = TestBed.inject(Compteur);
  });

  it('compte chaque fois que la recette est cuisinée, sans le placard', () => {
    const depart = compteur.restes();
    compteur.cuisiner(RECETTE);
    compteur.cuisiner(RECETTE);
    compteur.cuisiner(RECETTE);
    expect(compteur.fois('Omelette test')).toBe(3);
    expect(compteur.restes()).toBe(depart + 3);
  });

  it('annule une seule fois à la fois, sans descendre sous zéro', () => {
    compteur.cuisiner(RECETTE);
    compteur.annuler(RECETTE);
    compteur.annuler(RECETTE);
    expect(compteur.fois('Omelette test')).toBe(0);
  });
});
