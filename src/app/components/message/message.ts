import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Messages } from '../../services/messages';

/** Affiche le dernier message, au-dessus du menu. */
@Component({
  selector: 'app-message',
  template: `
    <div class="zone" role="status" aria-live="polite">
      @if (messages.actuel(); as m) {
        <div class="message" [class.fete]="m.fete">
          @if (m.fete; as f) {
            <span class="medaille" aria-hidden="true">🎉</span>
            <span class="textes">
              <strong>{{ m.texte }}</strong>
              <small>{{ f.detail }}</small>
            </span>
          } @else {
            <span>{{ m.texte }}</span>
          }
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

    // Cap franchi : couleurs chaudes, la médaille qui rebondit, un reflet qui passe une fois.
    .fete {
      position: relative;
      overflow: hidden;
      justify-content: flex-start;
      padding: 12px 12px 12px 14px;
      background: var(--mustard-soft);
      color: var(--fg);
      border: 2px solid var(--mustard);
      animation: monte-fete 0.45s cubic-bezier(0.2, 1.4, 0.4, 1);

      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          105deg,
          transparent 35%,
          rgba(255, 255, 255, 0.55) 50%,
          transparent 65%
        );
        transform: translateX(-100%);
        animation: reflet 1.2s 0.35s ease-out;
        pointer-events: none;
      }

      .medaille {
        flex-shrink: 0;
        font-size: 1.7rem;
        line-height: 1;
        animation: rebond 0.7s 0.15s ease-out;
      }

      .textes {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 1px;
      }

      strong {
        font-family: var(--f-display);
        font-size: 1.02rem;
      }

      small {
        font-weight: 500;
        font-size: 0.85rem;
        color: var(--muted);
      }

      button {
        background: transparent;
        color: var(--muted);
        padding: 6px 8px;
      }
    }

    @keyframes monte-fete {
      from {
        opacity: 0;
        transform: translateY(14px) scale(0.92);
      }
    }

    @keyframes rebond {
      30% {
        transform: scale(1.35) rotate(-12deg);
      }
      60% {
        transform: scale(0.95) rotate(6deg);
      }
    }

    @keyframes reflet {
      to {
        transform: translateX(100%);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .fete,
      .fete::after,
      .fete .medaille {
        animation: none;
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
