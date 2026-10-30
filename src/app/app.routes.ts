import { Routes } from '@angular/router';
import { MesRestes } from './pages/mes-restes/mes-restes';
import { ParLegume } from './pages/par-legume/par-legume';

export const routes: Routes = [
  { path: 'legume/:id', component: ParLegume, title: 'Rien ne se jette' },
  { path: 'restes', component: MesRestes, title: 'Mes restes · Rien ne se jette' },
  { path: '**', redirectTo: 'legume/carotte' },
];
