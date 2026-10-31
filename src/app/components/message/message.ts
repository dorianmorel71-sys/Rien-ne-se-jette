import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Messages } from '../../services/messages';

/** Affiche le dernier message, au-dessus du menu. */
@Component({
  selector: 'app-message',
  template: `
    <div class="zone" role="status" aria-live="polite">
      @if (messages.actuel(); as m) {
        <div class="message">
          <span>{{ m.texte }}</span>
          @if (m.annuler) {
            <button type="button" (click)="messages.annuler()">Annuler</button>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .zone {
      position: fixed;
      z-index: 13;
      left: 50%;
      bottom: calc(64px + 20px + env(safe-area-inset-bottom, 0px));
      transform: translateX(-50%);
      width: min(480px, calc(100% - 20px));
      pointer-events: none;

      @media (min-width: 1000px) {
        bottom: 24px;
      }
    }

    .message {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 10px 10px 16px;
      border-radius: 16px;
      background: var(--fg);
      color: var(--bg);
      font-weight: 700;
      font-size: 0.92rem;
      box-shadow: var(--shadow);
      pointer-events: auto;
      animation: monte 0.2s ease-out;
    }

    @keyframes monte {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
    }

    button {
      flex-shrink: 0;
      font: inherit;
      border: 0;
      border-radius: 999px;
      padding: 6px 14px;
      background: var(--mustard);
      color: #2b1d14;
      cursor: pointer;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageAction {
  protected readonly messages = inject(Messages);
}
