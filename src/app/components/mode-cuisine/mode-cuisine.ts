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

  private readonly dialogue = viewChild.required<ElementRef<HTMLDialogElement>>('dialogue');
  private verrou?: Verrou;
  private departToucher = 0;

  constructor() {
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
