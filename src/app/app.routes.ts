import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { FONCTIONNALITES } from '../environments/fonctionnalites';
import { Compte } from './services/compte';
import { PAGES, titreOnglet } from './pages-noms';
import { PageAccueil } from './pages/accueil/accueil';
import { pageDeDepart } from './pages/accueil/premiere-visite';
import { PageCompte } from './pages/compte/compte';
import { PageFrigo } from './pages/frigo/frigo';
import { PageInvitation } from './pages/invitation/invitation';
import { MesRestes } from './pages/mes-restes/mes-restes';
import { ParLegume } from './pages/par-legume/par-legume';

export const routes: Routes = [
  { path: 'accueil', component: PageAccueil, title: titreOnglet(PAGES.accueil.nom) },
  { path: 'legume', redirectTo: () => pageDeDepart(true) },
  { path: 'legume/:id', component: ParLegume, title: titreOnglet(PAGES.aliments.nom) },
  { path: 'restes', component: MesRestes, title: titreOnglet(PAGES.recettes.nom) },
  // Le frigo et ses invitations n'existent que dans la version de développement.
  ...(FONCTIONNALITES.frigo
    ? [
        { path: 'frigo', component: PageFrigo, title: titreOnglet(PAGES.frigo.nom) },
        { path: 'foyer/:id', component: PageInvitation, title: titreOnglet(PAGES.invitation.nom) },
      ]
    : []),
  // Les favoris sont maintenant rangés dans Recettes et Aliments.
  { path: 'favoris', redirectTo: 'restes' },
  {
    path: 'compte',
    component: PageCompte,
    title: () => titreOnglet(inject(Compte).nomAffiche() ?? 'Se connecter'),
  },
  // Première visite : l'accueil qui explique l'appli ; ensuite, directement les légumes.
  { path: '**', redirectTo: () => pageDeDepart() },
];
