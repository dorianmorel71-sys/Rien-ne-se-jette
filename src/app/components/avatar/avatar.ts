import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Compte } from '../../services/compte';

/** Aliments proposés comme avatar, dans l'esprit de l'appli. */
export const EMOJIS_AVATAR = [
  '🥕',
  '🍅',
  '🧄',
  '🥦',
  '🍋',
  '🍆',
  '🧀',
  '🥖',
  '🍌',
  '🍄',
  '🥑',
  '🍓',
  '🌽',
  '🫑',
  '🥔',
  '🍐',
];

/** Couleurs de fond proposées : celles de l'appli. */
export const COULEURS_AVATAR = ['#fde2d6', '#e4efd2', '#fbe8c4', '#f8dde5', '#dcecf5', '#ecdcc3'];

/**
 * L'avatar du compte connecté : la photo Google, un aliment sur sa couleur, ou l'initiale.
 * Sa taille suit la police de l'élément parent (1,35 em).
 */
@Component({
  selector: 'app-avatar',
  template: `
    @if (photo(); as url) {
      <img [src]="url" alt="" referrerpolicy="no-referrer" (error)="photoCassee.set(true)" />
    } @else if (aliment(); as a) {
      <span class="aliment" [style.background]="a.couleur">{{ a.emoji }}</span>
    } @else {
      <span class="initiale">{{ compte.initiale() }}</span>
    }
  `,
  styles: `
    :host {
      display: inline-grid;
      width: 1.35em;
      height: 1.35em;
      flex-shrink: 0;
    }

    img,
    span {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }

    img {
      object-fit: cover;
    }

    span {
      display: grid;
      place-items: center;
    }

    .aliment {
      font-size: 0.78em;
      line-height: 1;
    }

    .initiale {
      background: var(--mustard);
      color: #2b1d14;
      font-family: var(--f-display);
      font-weight: 800;
      font-size: 0.8em;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarCompte {
  protected readonly compte = inject(Compte);
  /** Photo Google introuvable : on retombe sur l'initiale. */
  protected readonly photoCassee = signal(false);

  protected readonly photo = computed(() => {
    const a = this.compte.avatar();
    return a && 'photo' in a && !this.photoCassee() ? this.compte.utilisateur()?.photo : null;
  });
  protected readonly aliment = computed(() => {
    const a = this.compte.avatar();
    return a && 'emoji' in a ? a : null;
  });
}
