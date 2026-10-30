import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Minuteurs } from '../../services/minuteurs';
import { formaterDuree } from '../../utils/duree';

/** Minuteur en cours, visible partout dans l'appli quand le mode cuisine est fermé. */
@Component({
  selector: 'app-rappel-minuteur',
  template: `
    @if (!minuteurs.enCuisine() && minuteurs.liste().length) {
      @if (minuteurs.sonnerie()) {
        <div class="rappel sonne" role="alert">
          <span>⏰ Minuteur terminé !</span>
          <button type="button" (click)="minuteurs.arreterSonnerie()">Arrêter</button>
        </div>
      } @else if (minuteurs.prochain(); as m) {
        <div class="rappel" role="timer">
          <span>
            ⏱️ {{ m.nom }}
            @if (minuteurs.liste().length > 1) {
              <span class="autres">+{{ minuteurs.liste().length - 1 }}</span>
            }
          </span>
          <strong>{{ formater(minuteurs.restant(m)) }}</strong>
        </div>
      }
    }
  `,
  styles: `
    .rappel {
      position: fixed;
      z-index: 12;
      left: 50%;
      bottom: calc(64px + 20px + env(safe-area-inset-bottom, 0px));
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 8px 8px 16px;
      border-radius: 999px;
      background: var(--fg);
      color: var(--bg);
      font-weight: 700;
      font-size: 0.92rem;
      box-shadow: var(--shadow);
      white-space: nowrap;

      @media (min-width: 1000px) {
        left: auto;
        right: 24px;
        bottom: 24px;
        transform: none;
      }
    }

    strong {
      font-family: var(--f-display);
      font-size: 1.15rem;
      font-variant-numeric: tabular-nums;
      padding-right: 8px;
    }

    .autres {
      opacity: 0.7;
      font-size: 0.85rem;
    }

    .sonne {
      background: var(--accent);
      color: var(--on-accent);
    }

    button {
      font: inherit;
      border: 0;
      border-radius: 999px;
      padding: 6px 14px;
      background: #fff;
      color: var(--accent);
      cursor: pointer;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RappelMinuteur {
  protected readonly minuteurs = inject(Minuteurs);
  protected readonly formater = formaterDuree;
}
