import { Injectable, signal } from '@angular/core';

export interface Message {
  id: number;
  texte: string;
  /** Pour revenir en arrière juste après une action. */
  annuler?: () => void;
}

/** Durée d'affichage d'un message, en millisecondes. */
const DUREE = 5000;

/** Petit message en bas de l'écran après une action : « ✓ Ajouté au frigo · Annuler ». */
@Injectable({ providedIn: 'root' })
export class Messages {
  readonly actuel = signal<Message | null>(null);
  private compteur = 0;
  private minuterie?: ReturnType<typeof setTimeout>;

  afficher(texte: string, annuler?: () => void): void {
    clearTimeout(this.minuterie);
    const message = { id: ++this.compteur, texte, annuler };
    this.actuel.set(message);
    this.minuterie = setTimeout(() => {
      if (this.actuel()?.id === message.id) this.actuel.set(null);
    }, DUREE);
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
