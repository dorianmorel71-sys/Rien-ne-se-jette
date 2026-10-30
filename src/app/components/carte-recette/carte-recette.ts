import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RecetteGeneree } from '../../models/recette';
import { Compteur } from '../../services/compteur';
import { Favoris } from '../../services/favoris';
import { Alerte } from '../alerte/alerte';
import { BoutonFavori } from '../bouton-favori/bouton-favori';

/** Carte d'une recette générée à partir des ingrédients cochés. */
@Component({
  selector: 'app-carte-recette',
  imports: [Alerte, BoutonFavori],
  templateUrl: './carte-recette.html',
  styleUrl: './carte-recette.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarteRecette {
  protected readonly favoris = inject(Favoris);
  protected readonly compteur = inject(Compteur);

  readonly recette = input.required<RecetteGeneree>();
  /** Affiche les étapes dépliées (utilisé pour la meilleure recette). */
  readonly ouverte = input(false);
  /** Recette enregistrée en favori : on n'affiche pas la correspondance avec les cases cochées. */
  readonly archivee = input(false);
}
