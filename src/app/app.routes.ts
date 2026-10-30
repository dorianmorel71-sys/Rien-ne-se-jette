import { Routes } from '@angular/router';
import { PageAccueil } from './pages/accueil/accueil';
import { pageDeDepart } from './pages/accueil/premiere-visite';
import { PageCompte } from './pages/compte/compte';
import { PageFavoris } from './pages/favoris/favoris';
import { PageFrigo } from './pages/frigo/frigo';
import { PageInvitation } from './pages/invitation/invitation';
import { MesRestes } from './pages/mes-restes/mes-restes';
import { ParLegume } from './pages/par-legume/par-legume';

export const routes: Routes = [
  { path: 'accueil', component: PageAccueil, title: 'Bienvenue · Rien ne se jette' },
  { path: 'legume', redirectTo: 'legume/carotte' },
  { path: 'legume/:id', component: ParLegume, title: 'Rien ne se jette' },
  { path: 'restes', component: MesRestes, title: 'Mes restes · Rien ne se jette' },
  { path: 'frigo', component: PageFrigo, title: 'Mon frigo · Rien ne se jette' },
  { path: 'favoris', component: PageFavoris, title: 'Favoris · Rien ne se jette' },
  { path: 'foyer/:id', component: PageInvitation, title: 'Invitation · Rien ne se jette' },
  { path: 'compte', component: PageCompte, title: 'Mon compte · Rien ne se jette' },
  // Première visite : l'accueil qui explique l'appli ; ensuite, directement les légumes.
  { path: '**', redirectTo: pageDeDepart },
];
