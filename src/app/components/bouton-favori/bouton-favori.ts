import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** Marque-page pour ajouter ou retirer un favori. */
@Component({
  selector: 'app-bouton-favori',
  template: `
    <button
      type="button"
      [attr.aria-pressed]="actif()"
      [title]="actif() ? 'Retirer des favoris' : 'Ajouter aux favoris'"
      (click)="basculer.emit()"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z" />
      </svg>
      {{ actif() ? 'Gardé' : 'Garder' }}
    </button>
  `,
  styles: `
    button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font: inherit;
      font-size: 0.85rem;
      font-weight: 700;
      padding: 6px 13px 6px 10px;
      border-radius: 999px;
      border: 1.5px solid var(--line);
      background: var(--surface);
      color: var(--muted);
      cursor: pointer;
      white-space: nowrap;
      transition:
        border-color 0.2s,
        background 0.2s,
        color 0.2s;

      svg {
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
        stroke-linejoin: round;
      }

      &:hover {
        border-color: var(--mustard);
        color: var(--fg);
      }

      &[aria-pressed='true'] {
        background: var(--mustard);
        border-color: var(--mustard);
        color: #2b1d14;

        svg {
          fill: currentColor;
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoutonFavori {
  readonly actif = input(false);
  readonly basculer = output();
}
