import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Legume } from '../../models/legume';
import { Alerte } from '../alerte/alerte';

/** Fiche d'un légume : ce qu'on peut faire de chaque partie. */
@Component({
  selector: 'app-fiche-legume',
  imports: [Alerte],
  templateUrl: './fiche-legume.html',
  styleUrl: './fiche-legume.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FicheLegume {
  readonly legume = input.required<Legume>();
}
