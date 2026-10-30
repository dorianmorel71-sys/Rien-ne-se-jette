import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RecetteProposee } from '../../models/recette';
import { Alerte } from '../alerte/alerte';

/** Carte d'une recette proposée à partir des restes cochés. */
@Component({
  selector: 'app-carte-recette',
  imports: [Alerte],
  templateUrl: './carte-recette.html',
  styleUrl: './carte-recette.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarteRecette {
  readonly proposition = input.required<RecetteProposee>();
  /** Affiche les étapes dépliées (utilisé pour la meilleure recette). */
  readonly ouverte = input(false);
}
