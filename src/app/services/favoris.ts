import { computed, effect, Injectable, signal } from '@angular/core';
import { RecetteGeneree } from '../models/recette';
import { ecrire, lire } from '../utils/stockage';

const CLE = 'rien-ne-se-jette.favoris';

export interface DonneesFavoris {
  legumes: string[];
  /** La recette telle qu'elle était affichée, avec les restes cochés à ce moment-là. */
  recettes: RecetteGeneree[];
}

/** Légumes et recettes mis de côté, gardés dans le navigateur. */
@Injectable({ providedIn: 'root' })
export class Favoris {
  private readonly donnees = signal<DonneesFavoris>(
    lire<DonneesFavoris>(CLE, { legumes: [], recettes: [] }),
  );

  /** Tout l'état, pour la sauvegarde dans le compte. */
  readonly etat = this.donnees.asReadonly();
  readonly legumes = computed(() => this.donnees().legumes);
  readonly recettes = computed(() => this.donnees().recettes);
  readonly nombre = computed(() => this.legumes().length + this.recettes().length);

  constructor() {
    effect(() => ecrire(CLE, this.donnees()));
  }

  remplacer(donnees: DonneesFavoris): void {
    this.donnees.set(donnees);
  }

  estLegumeFavori(id: string): boolean {
    return this.legumes().includes(id);
  }

  basculerLegume(id: string): void {
    this.donnees.update((d) => ({
      ...d,
      legumes: d.legumes.includes(id) ? d.legumes.filter((l) => l !== id) : [...d.legumes, id],
    }));
  }

  estRecetteFavorite(nom: string): boolean {
    return this.recettes().some((r) => r.nom === nom);
  }

  basculerRecette(recette: RecetteGeneree): void {
    this.donnees.update((d) => ({
      ...d,
      recettes: d.recettes.some((r) => r.nom === recette.nom)
        ? d.recettes.filter((r) => r.nom !== recette.nom)
        : [recette, ...d.recettes],
    }));
  }
}
