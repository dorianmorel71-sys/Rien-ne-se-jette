import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  output,
  signal,
  viewChildren,
} from '@angular/core';

/** Hauteur d'une ligne de la roue, en pixels (à garder en phase avec le SCSS). */
const HAUTEUR_LIGNE = 44;

interface Colonne {
  nom: string;
  unite: string;
  max: number;
  /** Nombre de secondes que vaut une unité de cette colonne. */
  secondes: number;
}

const COLONNES: Colonne[] = [
  { nom: 'heures', unite: 'h', max: 5, secondes: 3600 },
  { nom: 'minutes', unite: 'min', max: 59, secondes: 60 },
  { nom: 'secondes', unite: 's', max: 59, secondes: 1 },
];

/**
 * Sélecteur de durée à roues, comme sur iPhone : on fait défiler heures,
 * minutes et secondes, la valeur au centre est retenue.
 */
@Component({
  selector: 'app-roue-temps',
  templateUrl: './roue-temps.html',
  styleUrl: './roue-temps.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoueTemps {
  /** Durée en secondes. */
  readonly valeur = input.required<number>();
  readonly valeurChange = output<number>();

  protected readonly colonnes = COLONNES.map((c) => ({
    ...c,
    valeurs: Array.from({ length: c.max + 1 }, (_, i) => i),
  }));

  /** Valeur de chaque colonne, déduite de la durée. */
  protected readonly parties = computed(() => {
    const v = this.valeur();
    return COLONNES.map((c) => Math.floor(v / c.secondes) % (c.max + 1));
  });
  /** Ligne au centre pendant qu'on fait défiler, pour la mettre en valeur tout de suite. */
  protected readonly survolees = signal<number[]>([0, 0, 0]);

  private readonly roues = viewChildren<ElementRef<HTMLElement>>('roue');
  private readonly attentes: (ReturnType<typeof setTimeout> | undefined)[] = [];
  private pret = false;

  constructor() {
    afterNextRender(() => {
      this.placer(false);
      this.pret = true;
    });
    // Valeur changée de l'extérieur (une durée rapide) : les roues tournent jusqu'à elle.
    effect(() => {
      this.parties();
      if (this.pret) this.placer(true);
    });
  }

  private placer(doucement: boolean): void {
    const parties = this.parties();
    this.survolees.set([...parties]);
    this.roues().forEach((roue, i) => {
      const cible = parties[i] * HAUTEUR_LIGNE;
      if (Math.abs(roue.nativeElement.scrollTop - cible) > 2) {
        roue.nativeElement.scrollTo({ top: cible, behavior: doucement ? 'smooth' : 'instant' });
      }
    });
  }

  protected defiler(i: number, roue: HTMLElement): void {
    const ligne = this.ligne(i, roue);
    this.survolees.update((s) => s.map((v, j) => (j === i ? ligne : v)));
    // On retient la valeur quand la roue s'arrête.
    clearTimeout(this.attentes[i]);
    this.attentes[i] = setTimeout(() => this.choisir(i, this.ligne(i, roue)), 120);
  }

  /** Toucher une ligne la fait venir au centre. */
  protected toucher(i: number, valeur: number, roue: HTMLElement): void {
    roue.scrollTo({ top: valeur * HAUTEUR_LIGNE, behavior: 'smooth' });
  }

  /** Flèches haut et bas pour le clavier. */
  protected clavier(i: number, e: KeyboardEvent): void {
    const pas = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0;
    if (!pas) return;
    e.preventDefault();
    const max = COLONNES[i].max;
    this.choisir(i, (this.parties()[i] + pas + max + 1) % (max + 1));
  }

  private ligne(i: number, roue: HTMLElement): number {
    return Math.min(COLONNES[i].max, Math.max(0, Math.round(roue.scrollTop / HAUTEUR_LIGNE)));
  }

  private choisir(i: number, valeur: number): void {
    const parties = [...this.parties()];
    if (parties[i] === valeur) return;
    parties[i] = valeur;
    this.valeurChange.emit(parties.reduce((total, v, j) => total + v * COLONNES[j].secondes, 0));
  }
}
