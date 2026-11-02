import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FONCTIONNALITES } from '../../../environments/fonctionnalites';
import { TitrePage } from '../../components/titre-page/titre-page';
import { PAGES } from '../../pages-noms';

/** Politique de confidentialité, en clair : ce qui est gardé, où, et comment l'effacer. */
@Component({
  selector: 'app-confidentialite',
  imports: [RouterLink, TitrePage],
  templateUrl: './confidentialite.html',
  styleUrl: './confidentialite.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageConfidentialite {
  protected readonly page = PAGES.confidentialite;
  protected readonly frigoActif = FONCTIONNALITES.frigo;
  /** Responsable des données, comme le demande le RGPD. */
  protected readonly responsable = 'Dorian Morel';
  protected readonly email = 'riennesejette.contact@gmail.com';
  /** À changer à chaque modification du texte. */
  protected readonly miseAJour = '2 novembre 2026';
}
