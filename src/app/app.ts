import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Compteur } from './services/compteur';
import { Favoris } from './services/favoris';
import { Frigo } from './services/frigo';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly favoris = inject(Favoris);
  protected readonly compteur = inject(Compteur);
  protected readonly frigo = inject(Frigo);

  protected readonly liens = [
    { chemin: '/legume', icone: '🥕', libelle: 'Légumes' },
    { chemin: '/restes', icone: '🍲', libelle: 'Recettes' },
    { chemin: '/frigo', icone: '🧊', libelle: 'Frigo' },
    { chemin: '/favoris', icone: '🔖', libelle: 'Favoris' },
  ];
}
