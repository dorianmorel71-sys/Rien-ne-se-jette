import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RecetteGeneree } from '../../models/recette';
import { Alerte } from '../alerte/alerte';

/** Carte d'une recette générée à partir des ingrédients cochés. */
@Component({
  selector: 'app-carte-recette',
  imports: [Alerte],
  templateUrl: './carte-recette.html',
  styleUrl: './carte-recette.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarteRecette {
  readonly recette = input.required<RecetteGeneree>();
  /** Affiche les étapes dépliées (utilisé pour la meilleure recette). */
  readonly ouverte = input(false);
}
