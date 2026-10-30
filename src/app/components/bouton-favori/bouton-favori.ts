import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** Cœur pour ajouter ou retirer un favori. */
@Component({
  selector: 'app-bouton-favori',
  template: `
    <button
      type="button"
      [attr.aria-pressed]="actif()"
      [attr.aria-label]="actif() ? 'Retirer des favoris' : 'Ajouter aux favoris'"
      [title]="actif() ? 'Retirer des favoris' : 'Ajouter aux favoris'"
      (click)="basculer.emit()"
    >
      {{ actif() ? '♥' : '♡' }}
    </button>
  `,
  styles: `
    button {
      width: 38px;
      height: 38px;
      display: grid;
      place-items: center;
      font-size: 1.35rem;
      line-height: 1;
      border-radius: 50%;
      border: 1.5px solid var(--line);
      background: var(--surface);
      color: var(--accent);
      cursor: pointer;
      transition:
        transform 0.15s,
        background 0.2s;

      &:hover {
        transform: scale(1.08);
      }

      &[aria-pressed='true'] {
        background: var(--accent-soft);
        border-color: var(--accent);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoutonFavori {
  readonly actif = input(false);
  readonly basculer = output();
}
