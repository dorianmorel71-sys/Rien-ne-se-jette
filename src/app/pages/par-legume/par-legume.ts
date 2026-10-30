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
import { CATEGORIES_LEGUMES, LEGUMES } from '../../data/legumes';
import { astuceDuJour } from '../../data/astuces';
import { nomMois } from '../../utils/saison';
import { normaliser } from '../../utils/texte';

/** Largeur sous laquelle on fait défiler jusqu'à la fiche après un choix. */
const LARGEUR_MOBILE = 700;

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
  readonly deSaison = signal(false);

  private readonly moisCourant = new Date().getMonth() + 1;
  protected readonly nomMoisCourant = nomMois(this.moisCourant);
  protected readonly astuce = astuceDuJour();

  readonly legumesFiltres = computed(() => {
    const filtre = normaliser(this.recherche().trim());
    const mois = this.moisCourant;
    return LEGUMES.filter(
      (l) =>
        (!filtre || normaliser(l.nom).includes(filtre) || normaliser(l.id).includes(filtre)) &&
        (!this.deSaison() || !!l.saison?.includes(mois)),
    );
  });

  /** Légumes filtrés, rangés par famille puis par ordre alphabétique. */
  readonly groupes = computed(() =>
    CATEGORIES_LEGUMES.map((titre) => ({
      titre,
      legumes: this.legumesFiltres()
        .filter((l) => l.categorie === titre)
        .sort((a, b) => a.nom.localeCompare(b.nom, 'fr')),
    })).filter((g) => g.legumes.length > 0),
  );

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
