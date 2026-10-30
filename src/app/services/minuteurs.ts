import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';

export interface Minuteur {
  id: number;
  /** « Étape 3 », « Pâtes »… */
  nom: string;
  /** Durée réglée, en millisecondes. */
  duree: number;
  /** Heure de fin quand il tourne ; null en pause ou terminé. */
  fin: number | null;
  /** Temps restant quand il est en pause. */
  reste: number;
  /** Terminé : il sonne jusqu'à ce qu'on l'arrête. */
  sonne: boolean;
}

const MINUTE = 60_000;
/** Rafraîchissement de l'affichage : assez souvent pour que les secondes défilent bien. */
const INTERVALLE = 250;

/**
 * Minuteurs de cuisine, qui continuent de tourner quand on quitte le mode cuisine.
 * Le temps est calculé d'après l'heure de fin : il reste juste même si le
 * navigateur ralentit l'appli en arrière-plan.
 */
@Injectable({ providedIn: 'root' })
export class Minuteurs {
  readonly liste = signal<Minuteur[]>([]);
  readonly maintenant = signal(Date.now());
  readonly sonnerie = computed(() => this.liste().some((m) => m.sonne));
  /** Le plus proche de la fin, pour le rappel au-dessus du menu. */
  readonly prochain = computed(
    () =>
      this.liste()
        .filter((m) => m.fin !== null)
        .sort((a, b) => a.fin! - b.fin!)[0],
  );
  /** Vrai quand le mode cuisine est ouvert : il affiche lui-même les minuteurs. */
  readonly enCuisine = signal(false);

  private compteur = 0;
  private horloge?: ReturnType<typeof setInterval>;
  private audio?: AudioContext;
  private dernierBip = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearInterval(this.horloge));
  }

  restant(m: Minuteur): number {
    return m.fin === null ? m.reste : Math.max(0, m.fin - this.maintenant());
  }

  lancer(nom: string, minutes: number): void {
    // Créé pendant le clic : sinon les navigateurs refusent de jouer le son plus tard.
    this.preparerSon();
    const duree = Math.round(minutes * MINUTE);
    const maintenant = Date.now();
    this.maintenant.set(maintenant);
    this.liste.update((l) => [
      ...l,
      { id: ++this.compteur, nom, duree, fin: maintenant + duree, reste: duree, sonne: false },
    ]);
    this.demarrerHorloge();
  }

  pause(id: number): void {
    this.modifier(id, (m) => (m.fin === null ? m : { ...m, fin: null, reste: this.restant(m) }));
  }

  reprendre(id: number): void {
    this.preparerSon();
    this.modifier(id, (m) => (m.fin !== null || m.sonne ? m : { ...m, fin: Date.now() + m.reste }));
    this.demarrerHorloge();
  }

  /** Ajoute du temps ; sur un minuteur qui sonne, le relance pour cette durée. */
  ajouter(id: number, minutes: number): void {
    const ajout = minutes * MINUTE;
    this.modifier(id, (m) => {
      if (m.sonne) return { ...m, sonne: false, fin: Date.now() + ajout, reste: ajout };
      if (m.fin === null) return { ...m, reste: m.reste + ajout };
      return { ...m, fin: m.fin + ajout };
    });
    this.demarrerHorloge();
  }

  arreter(id: number): void {
    this.liste.update((l) => l.filter((m) => m.id !== id));
  }

  /** Arrête tous ceux qui sonnent. */
  arreterSonnerie(): void {
    this.liste.update((l) => l.filter((m) => !m.sonne));
  }

  /** Avance l'horloge : les minuteurs arrivés au bout se mettent à sonner. */
  actualiser(maintenant = Date.now()): void {
    this.maintenant.set(maintenant);
    let fini = false;
    this.liste.update((l) =>
      l.map((m) => {
        if (m.fin === null || m.fin > maintenant) return m;
        fini = true;
        return { ...m, fin: null, reste: 0, sonne: true };
      }),
    );
    // Tant qu'un minuteur sonne : alarme et vibration toutes les secondes.
    if (this.sonnerie() && (fini || maintenant - this.dernierBip >= 1000)) {
      this.dernierBip = maintenant;
      this.biper();
      navigator.vibrate?.([250, 100, 250]);
    }
    if (!this.liste().some((m) => m.fin !== null || m.sonne)) {
      clearInterval(this.horloge);
      this.horloge = undefined;
    }
  }

  private modifier(id: number, changer: (m: Minuteur) => Minuteur): void {
    this.liste.update((l) => l.map((m) => (m.id === id ? changer(m) : m)));
  }

  private demarrerHorloge(): void {
    if (this.horloge) return;
    this.horloge = setInterval(() => this.actualiser(), INTERVALLE);
  }

  private preparerSon(): void {
    const Contexte = globalThis.AudioContext;
    if (!Contexte) return;
    this.audio ??= new Contexte();
    void this.audio.resume();
  }

  /** Fait entendre la sonnerie une fois, pour régler le volume. */
  testerSonnerie(): void {
    this.preparerSon();
    this.biper();
  }

  /**
   * Alarme stridente : quatre bips rapides sur deux notes aiguës, en onde carrée
   * (plus perçante qu'une onde douce), pour qu'on l'entende par-dessus la hotte.
   */
  private biper(): void {
    const audio = this.audio;
    if (!audio) return;
    // Le navigateur peut avoir mis le son en veille pendant l'attente.
    void audio.resume();
    for (let i = 0; i < 4; i++) {
      const debut = audio.currentTime + i * 0.14;
      const oscillateur = audio.createOscillator();
      const volume = audio.createGain();
      oscillateur.type = 'square';
      oscillateur.frequency.value = i % 2 ? 1568 : 1047;
      volume.gain.setValueAtTime(0.0001, debut);
      volume.gain.exponentialRampToValueAtTime(0.5, debut + 0.005);
      volume.gain.setValueAtTime(0.5, debut + 0.09);
      volume.gain.exponentialRampToValueAtTime(0.0001, debut + 0.11);
      oscillateur.connect(volume).connect(audio.destination);
      oscillateur.start(debut);
      oscillateur.stop(debut + 0.12);
    }
  }
}
