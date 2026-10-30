import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { INDISPENSABLES } from '../../data/ingredients';
import { RecetteGeneree } from '../../models/recette';
import { Minuteurs } from '../../services/minuteurs';
import { dureeDansEtape, formaterDuree } from '../../utils/duree';

/** Verrou qui empêche l'écran de se mettre en veille (absent sur les vieux navigateurs). */
interface Verrou {
  release(): Promise<void>;
}

/**
 * Recette en plein écran, une étape à la fois, en gros caractères,
 * avec l'écran qui reste allumé.
 */
@Component({
  selector: 'app-mode-cuisine',
  templateUrl: './mode-cuisine.html',
  styleUrl: './mode-cuisine.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown)': 'clavier($event)' },
})
export class ModeCuisine {
  readonly recette = input.required<RecetteGeneree>();
  readonly fermer = output<void>();
  readonly cuisinee = output<void>();

  protected readonly indispensables = INDISPENSABLES;
  /** 0 : les ingrédients ; ensuite une étape par écran ; à la fin, l'écran « bon appétit ». */
  protected readonly ecran = signal(0);
  protected readonly nombreEcrans = computed(() => this.recette().etapes.length + 2);
  protected readonly ecrans = computed(() =>
    Array.from({ length: this.nombreEcrans() }, (_, i) => i),
  );
  protected readonly fin = computed(() => this.ecran() === this.nombreEcrans() - 1);
  protected readonly ecranAllume = signal(false);

  protected readonly minuteurs = inject(Minuteurs);
  protected readonly formater = formaterDuree;
  /** Durée trouvée dans l'étape affichée, pour la lancer en un geste. */
  protected readonly dureeEtape = computed(() => {
    const etape = this.recette().etapes[this.ecran() - 1];
    return etape && !this.fin() ? dureeDansEtape(etape) : null;
  });
  /** Panneau de réglage d'un minuteur libre. */
  protected readonly reglage = signal(false);
  /** Durée réglée, en secondes. */
  protected readonly secondesReglees = signal(5 * 60);
  protected readonly minutesReglage = computed(() => Math.floor(this.secondesReglees() / 60));
  protected readonly secondesReglage = computed(() => this.secondesReglees() % 60);
  protected readonly dureesRapides = [1, 3, 5, 10, 15, 20, 30, 45, 60];
  protected readonly champsReglage = [
    { nom: 'minutes' as const, pas: 60, plus: 'Une minute de plus', moins: 'Une minute de moins' },
    { nom: 'secondes' as const, pas: 5, plus: '5 secondes de plus', moins: '5 secondes de moins' },
  ];
  protected readonly formaterReglage = (secondes: number) => formaterDuree(secondes * 1000);

  private readonly dialogue = viewChild.required<ElementRef<HTMLDialogElement>>('dialogue');
  private verrou?: Verrou;
  private departToucher = 0;

  constructor() {
    this.minuteurs.enCuisine.set(true);
    afterNextRender(() => {
      this.dialogue().nativeElement.showModal();
      void this.garderEcranAllume();
    });
    // Le verrou saute quand on change d'appli : on le reprend au retour.
    const auRetour = () => {
      if (document.visibilityState === 'visible') void this.garderEcranAllume();
    };
    document.addEventListener('visibilitychange', auRetour);
    inject(DestroyRef).onDestroy(() => {
      document.removeEventListener('visibilitychange', auRetour);
      this.minuteurs.enCuisine.set(false);
      void this.verrou?.release();
    });
  }

  private async garderEcranAllume(): Promise<void> {
    const wakeLock = (navigator as { wakeLock?: { request(type: 'screen'): Promise<Verrou> } })
      .wakeLock;
    if (!wakeLock) return;
    try {
      this.verrou = await wakeLock.request('screen');
      this.ecranAllume.set(true);
    } catch {
      this.ecranAllume.set(false);
    }
  }

  protected lancerEtape(minutes: number): void {
    this.minuteurs.lancer(`Étape ${this.ecran()}`, minutes);
  }

  /** Ajoute ou retire des secondes, entre 0 et 3 h. */
  protected ajusterReglage(secondes: number): void {
    this.secondesReglees.update((s) => Math.min(3 * 3600, Math.max(0, s + secondes)));
  }

  /** Minutes ou secondes tapées au clavier. */
  protected saisir(champ: 'minutes' | 'secondes', valeur: string): void {
    const nombre = Math.max(0, Math.floor(Number(valeur) || 0));
    const minutes = champ === 'minutes' ? Math.min(180, nombre) : this.minutesReglage();
    const secondes = champ === 'secondes' ? Math.min(59, nombre) : this.secondesReglage();
    this.secondesReglees.set(minutes * 60 + secondes);
  }

  protected lancerReglage(): void {
    const secondes = this.secondesReglees();
    if (!secondes) return;
    this.minuteurs.lancer(`Minuteur ${this.formaterReglage(secondes)}`, secondes / 60);
    this.reglage.set(false);
  }

  protected suivant(): void {
    this.ecran.update((e) => Math.min(e + 1, this.nombreEcrans() - 1));
  }

  protected precedent(): void {
    this.ecran.update((e) => Math.max(e - 1, 0));
  }

  protected clavier(e: KeyboardEvent): void {
    // Pas la barre d'espace : elle active déjà le bouton qui a le focus.
    if (e.key === 'ArrowRight') {
      this.suivant();
    } else if (e.key === 'ArrowLeft') {
      this.precedent();
    }
  }

  // Glisser vers la gauche ou la droite pour changer d'étape, les doigts pleins de farine.
  protected toucher(e: TouchEvent): void {
    this.departToucher = e.touches[0].clientX;
  }

  protected lacher(e: TouchEvent): void {
    const ecart = e.changedTouches[0].clientX - this.departToucher;
    if (ecart < -60) this.suivant();
    else if (ecart > 60) this.precedent();
  }

  protected terminer(): void {
    this.cuisinee.emit();
    this.dialogue().nativeElement.close();
  }
}
