import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Minuteurs } from '../../services/minuteurs';

/**
 * Écran entier qui clignote quand un minuteur arrive au bout : sur iPhone, les
 * sites ne peuvent pas vibrer, il faut donc que ça se voie de loin.
 */
@Component({
  selector: 'app-alerte-minuteur',
  template: `
    @if (minuteurs.sonnerie()) {
      <div class="alerte" role="alertdialog" aria-labelledby="alerte-titre">
        <p class="reveil" aria-hidden="true">⏰</p>
        <p id="alerte-titre" class="titre">C'est prêt !</p>
        <p class="noms">{{ noms() }}</p>
        <button class="arreter" type="button" (click)="minuteurs.arreterSonnerie()">Arrêter</button>
        <button class="encore" type="button" (click)="uneMinuteDePlus()">+1 min</button>
      </div>
    }
  `,
  styles: `
    .alerte {
      position: fixed;
      inset: 0;
      z-index: 100;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 14px;
      padding: 24px;
      text-align: center;
      background: var(--accent);
      color: #fff;
      animation: clignote 0.6s steps(1, end) infinite;
    }

    @keyframes clignote {
      50% {
        background: var(--berry);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .alerte {
        animation: none;
      }
    }

    p {
      margin: 0;
    }

    .reveil {
      font-size: 5rem;
      line-height: 1;
      animation: secoue 0.25s ease-in-out infinite alternate;
    }

    @keyframes secoue {
      from {
        transform: rotate(-12deg);
      }
      to {
        transform: rotate(12deg);
      }
    }

    .titre {
      font-family: var(--f-display);
      font-weight: 800;
      font-size: clamp(2.6rem, 12vw, 4rem);
      line-height: 1;
    }

    .noms {
      font-size: 1.2rem;
      opacity: 0.9;
    }

    button {
      font: inherit;
      font-weight: 800;
      border-radius: 999px;
      cursor: pointer;
    }

    .arreter {
      margin-top: 12px;
      width: min(320px, 100%);
      padding: 20px;
      border: 0;
      background: #fff;
      color: var(--accent);
      font-size: 1.5rem;
    }

    .encore {
      padding: 12px 24px;
      border: 2px solid #fff;
      background: transparent;
      color: #fff;
      font-size: 1.1rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlerteMinuteur {
  protected readonly minuteurs = inject(Minuteurs);

  protected readonly noms = computed(() =>
    this.minuteurs
      .liste()
      .filter((m) => m.sonne)
      .map((m) => m.nom)
      .join(' · '),
  );

  protected uneMinuteDePlus(): void {
    for (const m of this.minuteurs.liste().filter((m) => m.sonne)) this.minuteurs.ajouter(m.id, 1);
  }
}
