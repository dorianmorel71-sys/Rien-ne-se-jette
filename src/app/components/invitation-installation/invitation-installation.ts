import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Installation } from '../../services/installation';

/** Encart qui propose d'ajouter l'appli à l'écran d'accueil. */
@Component({
  selector: 'app-invitation-installation',
  templateUrl: './invitation-installation.html',
  styleUrl: './invitation-installation.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvitationInstallation {
  protected readonly installation = inject(Installation);
}
