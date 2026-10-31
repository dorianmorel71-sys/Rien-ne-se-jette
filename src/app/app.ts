import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MessageAction } from './components/message/message';
import { RappelMinuteur } from './components/rappel-minuteur/rappel-minuteur';
import { PAGES } from './pages-noms';
import { Compte } from './services/compte';
import { Compteur } from './services/compteur';
import { Favoris } from './services/favoris';
import { Foyer } from './services/foyer';
import { Frigo } from './services/frigo';
import { Installation } from './services/installation';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, RappelMinuteur, MessageAction],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly favoris = inject(Favoris);
  protected readonly compteur = inject(Compteur);
  protected readonly frigo = inject(Frigo);
  protected readonly compte = inject(Compte);
  // Démarré dès l'ouverture pour suivre le frigo partagé.
  private readonly foyer = inject(Foyer);
  // Démarré dès l'ouverture pour ne pas rater la proposition d'installation du navigateur.
  protected readonly installation = inject(Installation);

  protected readonly liens = [PAGES.aliments, PAGES.recettes, PAGES.frigo, PAGES.favoris];
}
