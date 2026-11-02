import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FONCTIONNALITES } from '../../../environments/fonctionnalites';
import { RecetteGeneree } from '../../models/recette';
import { Compteur, enEuros, PALIERS } from '../../services/compteur';
import { Favoris } from '../../services/favoris';
import { Frigo } from '../../services/frigo';
import { Messages } from '../../services/messages';
import { libelleDelai, niveauDelai } from '../../utils/urgence';
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
  /** « végétarien » n'apporte rien quand aucune recette n'a de viande. */
  protected readonly avecViande = FONCTIONNALITES.viandePoisson;

  /** Restes du frigo, pour afficher le temps qu'il leur reste avant leur date. */
  protected readonly auFrigo = computed(
    () => new Map(this.frigo.auFrigo().map((r) => [r.id, r] as const)),
  );
  protected readonly delai = libelleDelai;
  protected readonly niveau = niveauDelai;

  /**
   * Envoie la recette à quelqu'un (WhatsApp, SMS…) avec le lien de l'appli,
   * ou la copie quand le navigateur ne sait pas partager.
   */
  protected async partager(): Promise<void> {
    const r = this.recette();
    const lien = location.origin + location.pathname;
    const texte = [
      `${r.emoji ?? '🍽️'} ${r.nom} (${r.temps})`,
      `Avec : ${r.ingredients.map((i) => i.nom.toLowerCase()).join(', ')}`,
      r.etapes.map((e, i) => `${i + 1}. ${e}`).join('\n'),
      'Trouvée sur Rien ne se jette, l’appli pour cuisiner ses restes 🌱',
    ].join('\n\n');
    if (navigator.share) {
      try {
        await navigator.share({ title: r.nom, text: texte, url: lien });
      } catch {
        // Partage annulé : rien à faire.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(`${texte}\n${lien}`);
      this.messages.afficher('📋 Recette copiée : colle-la où tu veux');
    } catch {
      this.messages.afficher('Impossible de copier la recette sur cet appareil');
    }
  }

  /** Compte la recette et sort ses restes du frigo. */
  protected cuisiner(): void {
    const recette = this.recette();
    const restesAvant = this.compteur.restes();
    this.compteur.cuisiner(recette);
    const sortis = this.frigo.retirer(recette.ingredients.map((i) => i.id));
    const total = this.compteur.restes();
    const sauves = total - restesAvant;
    const palier = PALIERS.filter((p) => restesAvant < p && total >= p).at(-1);
    const annuler = () => {
      this.compteur.annuler(recette);
      this.frigo.remettre(sortis);
    };
    if (palier) {
      this.messages.afficher(`${palier} restes sauvés !`, annuler, {
        detail: `Environ ${enEuros(total)} d’économies, bravo !`,
      });
      return;
    }
    this.messages.afficher(
      sauves > 0
        ? `🌱 Bravo, ${sauves} ${sauves > 1 ? 'restes sauvés' : 'reste sauvé'} (≈ ${enEuros(sauves)}) !`
        : '✓ Recette notée',
      annuler,
    );
  }
}
