import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { RecetteGeneree } from '../../models/recette';
import { Compteur } from '../../services/compteur';
import { Favoris } from '../../services/favoris';
import { Frigo } from '../../services/frigo';
import { Messages } from '../../services/messages';
import { Alerte } from '../alerte/alerte';
import { BoutonFavori } from '../bouton-favori/bouton-favori';
import { ModeCuisine } from '../mode-cuisine/mode-cuisine';

/** Carte d'une recette générée à partir des ingrédients cochés. */
@Component({
  selector: 'app-carte-recette',
  imports: [Alerte, BoutonFavori, ModeCuisine],
  templateUrl: './carte-recette.html',
  styleUrl: './carte-recette.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarteRecette {
  protected readonly favoris = inject(Favoris);
  protected readonly compteur = inject(Compteur);
  private readonly frigo = inject(Frigo);
  private readonly messages = inject(Messages);

  readonly recette = input.required<RecetteGeneree>();
  /** Affiche les étapes dépliées (utilisé pour la meilleure recette). */
  readonly ouverte = input(false);
  /** Recette enregistrée en favori : on n'affiche pas la correspondance avec les cases cochées. */
  readonly archivee = input(false);

  protected readonly enCuisine = signal(false);

  /** Compte la recette et sort ses restes du frigo. */
  protected cuisiner(): void {
    const recette = this.recette();
    const restesAvant = this.compteur.restes();
    this.compteur.cuisiner(recette);
    const sortis = this.frigo.retirer(recette.ingredients.map((i) => i.id));
    const sauves = this.compteur.restes() - restesAvant;
    this.messages.afficher(
      sauves > 0
        ? `🌱 Bravo, ${sauves} ${sauves > 1 ? 'restes sauvés' : 'reste sauvé'} !`
        : '✓ Recette notée',
      () => {
        this.compteur.annuler(recette);
        this.frigo.remettre(sortis);
      },
    );
  }
}
