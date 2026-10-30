import { Routes } from '@angular/router';
import { PageFavoris } from './pages/favoris/favoris';
import { MesRestes } from './pages/mes-restes/mes-restes';
import { ParLegume } from './pages/par-legume/par-legume';

export const routes: Routes = [
  { path: 'legume/:id', component: ParLegume, title: 'Rien ne se jette' },
  { path: 'restes', component: MesRestes, title: 'Mes restes · Rien ne se jette' },
  { path: 'favoris', component: PageFavoris, title: 'Favoris · Rien ne se jette' },
  { path: '**', redirectTo: 'legume/carotte' },
];
