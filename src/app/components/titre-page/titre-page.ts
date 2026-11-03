import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AvatarCompte } from '../avatar/avatar';

/** Titre d'une page, le même que dans le menu et l'onglet du navigateur. */
@Component({
  selector: 'app-titre-page',
  imports: [AvatarCompte],
  template: `
    <h2>
      @if (avatar()) {
        <app-avatar class="avatar" aria-hidden="true" />
      } @else {
        <span class="icone" aria-hidden="true">{{ icone() }}</span>
      }
      {{ titre() }}
    </h2>
    @if (sousTitre()) {
      <p>{{ sousTitre() }}</p>
    }
  `,
  styles: `
    :host {
      display: block;
    }

    h2 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
      font-family: var(--f-display);
      font-weight: 800;
      font-size: clamp(1.7rem, 6vw, 2.1rem);
      line-height: 1.1;
      letter-spacing: -0.02em;
    }

    .icone {
      font-size: 0.85em;
    }

    .avatar {
      font-size: 1.1em;
    }

    p {
      margin: 4px 0 0;
      color: var(--muted);
      max-width: 52ch;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitrePage {
  readonly icone = input.required<string>();
  readonly titre = input.required<string>();
  readonly sousTitre = input<string>();
  /** Initiale de la personne connectée : affichée dans un rond à la place de l'icône. */
  /** Affiche l'avatar du compte à la place de l'icône. */
  readonly avatar = input(false);
}
