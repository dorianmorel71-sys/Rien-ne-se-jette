import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { Legume } from '../../models/legume';
import { Favoris } from '../../services/favoris';
import { SelectionRestes } from '../../services/selection-restes';
import { Alerte } from '../alerte/alerte';
import { BoutonFavori } from '../bouton-favori/bouton-favori';

/** Fiche d'un légume : ce qu'on peut faire de chaque partie. */
@Component({
  selector: 'app-fiche-legume',
  imports: [Alerte, BoutonFavori],
  templateUrl: './fiche-legume.html',
  styleUrl: './fiche-legume.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FicheLegume {
  private readonly router = inject(Router);
  private readonly selection = inject(SelectionRestes);
  protected readonly favoris = inject(Favoris);

  readonly legume = input.required<Legume>();

  /** Coche les restes de ce légume et ouvre les recettes correspondantes. */
  voirRecettes(): void {
    this.selection.ajouter(this.legume().restes ?? []);
    this.selection.defilerVersRecettes.set(true);
    this.router.navigate(['/restes']);
  }
}
