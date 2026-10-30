import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Compte } from '../../services/compte';
import { Compteur } from '../../services/compteur';
import { marquerAccueilVu } from './premiere-visite';

/** À quoi sert l'appli et comment s'en servir : montrée à la première visite. */
@Component({
  selector: 'app-accueil',
  imports: [RouterLink],
  templateUrl: './accueil.html',
  styleUrl: './accueil.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageAccueil {
  protected readonly compte = inject(Compte);
  protected readonly compteur = inject(Compteur);

  protected readonly etapes = [
    {
      emoji: '🥕',
      couleur: 'herbes',
      titre: 'Que faire de ce légume ?',
      texte:
        'Fanes, épluchures, trognon, graines : pour chaque légume et fruit, ce qui se mange et comment le cuisiner.',
      lien: '/legume/carotte',
      action: 'Voir les légumes',
    },
    {
      emoji: '🍲',
      couleur: 'tomate',
      titre: 'Une recette avec ce que j’ai',
      texte:
        'Coche tes restes et ce qu’il y a dans le placard : l’appli propose des recettes qui n’utilisent que ça.',
      lien: '/restes',
      action: 'Trouver une recette',
    },
    {
      emoji: '🧊',
      couleur: 'glace',
      titre: 'Mon frigo sous contrôle',
      texte:
        'Note ce que tu mets de côté : on te dit quoi finir en premier et quoi cuisiner ce soir. Partageable avec ton foyer.',
      lien: '/frigo',
      action: 'Ouvrir le frigo',
    },
    {
      emoji: '👩‍🍳',
      couleur: 'moutarde',
      titre: 'Cuisiner sans se salir l’écran',
      texte:
        'Le mode cuisine affiche la recette étape par étape, en grand, avec des minuteurs. L’écran reste allumé.',
      lien: '/restes',
      action: 'Essayer une recette',
    },
  ];

  constructor() {
    // Vue une fois : on arrivera ensuite directement sur les légumes.
    marquerAccueilVu();
  }
}
