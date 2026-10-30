import { computed, inject, Injectable, signal } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { ecrire, lire } from '../utils/stockage';

const CLE_MASQUEE = 'rien-ne-se-jette.installation-masquee';

/** Événement Chrome et Android qui permet d'ouvrir la fenêtre d'installation. */
interface EvenementInstallation extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** Installation sur l'écran d'accueil et arrivée des nouvelles versions. */
@Injectable({ providedIn: 'root' })
export class Installation {
  private readonly miseAJour = inject(SwUpdate);

  private readonly evenement = signal<EvenementInstallation | null>(null);
  private readonly installee = signal(
    !!globalThis.matchMedia?.('(display-mode: standalone)')?.matches ||
      (navigator as { standalone?: boolean }).standalone === true,
  );
  private readonly masquee = signal(lire(CLE_MASQUEE, false));

  /** iPhone et iPad : pas de bouton possible, on explique le menu Partager. */
  readonly ios =
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.userAgent.includes('Macintosh') && navigator.maxTouchPoints > 1);

  readonly proposer = computed(
    () => !this.installee() && !this.masquee() && (!!this.evenement() || this.ios),
  );
  /** Vrai quand une nouvelle version de l'appli est prête. */
  readonly nouvelleVersion = signal(false);

  constructor() {
    addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.evenement.set(e as EvenementInstallation);
    });
    addEventListener('appinstalled', () => this.installee.set(true));

    if (this.miseAJour.isEnabled) {
      this.miseAJour.versionUpdates.subscribe((e) => {
        if (e.type === 'VERSION_READY') this.nouvelleVersion.set(true);
      });
    }
  }

  async installer(): Promise<void> {
    const evenement = this.evenement();
    if (!evenement) return;
    await evenement.prompt();
    const { outcome } = await evenement.userChoice;
    this.evenement.set(null);
    if (outcome === 'accepted') this.installee.set(true);
  }

  masquer(): void {
    this.masquee.set(true);
    ecrire(CLE_MASQUEE, true);
  }

  recharger(): void {
    location.reload();
  }
}
