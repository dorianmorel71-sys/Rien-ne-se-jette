import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InvitationInstallation } from '../../components/invitation-installation/invitation-installation';
import { PAGES } from '../../pages-noms';
import { Compte } from '../../services/compte';
import { Compteur } from '../../services/compteur';
import { marquerAccueilVu } from './premiere-visite';

/** À quoi sert l'appli et comment s'en servir : montrée à la première visite. */
@Component({
  selector: 'app-accueil',
  imports: [RouterLink, InvitationInstallation],
  templateUrl: './accueil.html',
  styleUrl: './accueil.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageAccueil {
  protected readonly compte = inject(Compte);
  protected readonly compteur = inject(Compteur);

  protected readonly etapes = [
    {
      page: PAGES.aliments,
      couleur: 'herbes',
      titre: 'Que faire de cet aliment ?',
      texte:
        'Fanes, épluchures, trognon, os, arêtes : pour chaque aliment, ce qui se mange et comment le cuisiner.',
    },
    {
      page: PAGES.recettes,
      couleur: 'tomate',
      titre: 'Une recette avec ce que j’ai',
      texte:
        'Ton frigo est déjà coché : ajoute ton placard, l’appli propose des recettes qui n’utilisent que ça.',
    },
    {
      page: PAGES.frigo,
      couleur: 'glace',
      titre: 'Quoi finir en premier ?',
      texte:
        'Note ce que tu mets de côté : on te dit quoi finir et quoi cuisiner ce soir. Partageable avec ton foyer.',
    },
    {
      page: { ...PAGES.recettes, icone: '👩‍🍳', nom: 'Mode cuisine' },
      couleur: 'moutarde',
      titre: 'Cuisiner sans se salir l’écran',
      texte:
        'Sur chaque recette : les étapes en grand, une par une, avec des minuteurs. L’écran reste allumé.',
    },
  ];

  constructor() {
    // Vue une fois : on arrivera ensuite directement sur les légumes.
    marquerAccueilVu();
  }
}
