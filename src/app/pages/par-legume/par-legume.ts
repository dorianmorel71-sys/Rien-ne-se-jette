import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { FicheLegume } from '../../components/fiche-legume/fiche-legume';
import { LEGUMES } from '../../data/legumes';

/** Largeur sous laquelle on fait défiler jusqu'à la fiche après un choix. */
const LARGEUR_MOBILE = 700;

/** Sans accents ni majuscules, pour une recherche tolérante. */
const normaliser = (texte: string) => texte.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

@Component({
  selector: 'app-par-legume',
  imports: [FicheLegume],
  templateUrl: './par-legume.html',
  styleUrl: './par-legume.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParLegume {
  private readonly router = inject(Router);

  /** Identifiant du légume, lu dans l'URL (#/legume/:id). */
  readonly id = input<string>();

  readonly recherche = signal('');

  readonly legumesFiltres = computed(() => {
    const filtre = normaliser(this.recherche().trim());
    return LEGUMES.filter(
      (l) => !filtre || normaliser(l.nom).includes(filtre) || normaliser(l.id).includes(filtre),
    );
  });

  readonly legume = computed(() => LEGUMES.find((l) => l.id === this.id()) ?? LEGUMES[0]);

  private readonly fiche = viewChild(FicheLegume, { read: ElementRef });

  choisir(id: string, defiler = false): void {
    this.router.navigate(['/legume', id], { replaceUrl: true });
    if (defiler && window.innerWidth < LARGEUR_MOBILE) {
      this.fiche()?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  rechercher(valeur: string): void {
    this.recherche.set(valeur);
    const resultats = this.legumesFiltres();
    if (resultats.length === 1) this.choisir(resultats[0].id);
  }

  validerRecherche(): void {
    const premier = this.legumesFiltres()[0];
    if (premier) this.choisir(premier.id);
  }

  auHasard(): void {
    const autres = LEGUMES.filter((l) => l.id !== this.legume().id);
    this.recherche.set('');
    this.choisir(autres[Math.floor(Math.random() * autres.length)].id);
  }
}
