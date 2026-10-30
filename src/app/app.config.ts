import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withHashLocation } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Routage par « # » pour que l'appli marche sur un hébergement statique (GitHub Pages).
    provideRouter(routes, withHashLocation(), withComponentInputBinding()),
  ],
};
