import { TestBed } from '@angular/core/testing';
import { Messages } from './messages';

describe('Messages', () => {
  it('annule la dernière action puis se ferme', () => {
    const messages = TestBed.inject(Messages);
    let annule = false;
    messages.afficher('✓ Ajouté', () => (annule = true));
    expect(messages.actuel()?.texte).toBe('✓ Ajouté');
    messages.annuler();
    expect(annule).toBe(true);
    expect(messages.actuel()).toBeNull();
  });
});
