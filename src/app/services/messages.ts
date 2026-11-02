import { Injectable, signal } from '@angular/core';

export interface Message {
  id: number;
  texte: string;
  /** Pour revenir en arrière juste après une action. */
  annuler?: () => void;
  /** Un cap franchi : message plus chaleureux, avec une seconde ligne. */
  fete?: { detail: string };
}

/** Durée d'affichage d'un message, en millisecondes. */
const DUREE = 5000;
/** Un cap franchi reste un peu plus longtemps : on a le temps de le savourer. */
const DUREE_FETE = 8000;

/** Petit message en bas de l'écran après une action : « ✓ Ajouté au frigo · Annuler ». */
@Injectable({ providedIn: 'root' })
export class Messages {
  readonly actuel = signal<Message | null>(null);
  private compteur = 0;
  private minuterie?: ReturnType<typeof setTimeout>;

  afficher(texte: string, annuler?: () => void, fete?: { detail: string }): void {
    clearTimeout(this.minuterie);
    const message = { id: ++this.compteur, texte, annuler, fete };
    this.actuel.set(message);
    this.minuterie = setTimeout(
      () => {
        if (this.actuel()?.id === message.id) this.actuel.set(null);
      },
      fete ? DUREE_FETE : DUREE,
    );
  }

  annuler(): void {
    this.actuel()?.annuler?.();
    this.fermer();
  }

  fermer(): void {
    clearTimeout(this.minuterie);
    this.actuel.set(null);
  }
}
