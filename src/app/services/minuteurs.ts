import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { creerSonAlarme } from '../utils/alarme';

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
  /**
   * Lecteur audio classique plutôt que l'API Web Audio : sur iPhone, celle-ci est
   * coupée par le mode silencieux, alors qu'un lecteur se comporte comme une vidéo.
   */
  private lecteur?: HTMLAudioElement;
  private finTest?: ReturnType<typeof setTimeout>;
  private derniereVibration = 0;

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
    this.taireSiFini();
    this.demarrerHorloge();
  }

  arreter(id: number): void {
    this.liste.update((l) => l.filter((m) => m.id !== id));
    this.taireSiFini();
  }

  /** Arrête tous ceux qui sonnent. */
  arreterSonnerie(): void {
    this.liste.update((l) => l.filter((m) => !m.sonne));
    this.taireSiFini();
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
    if (fini) this.sonner();
    // Android seulement : Apple ne laisse pas les sites faire vibrer l'iPhone.
    if (this.sonnerie() && maintenant - this.derniereVibration >= 1600) {
      this.derniereVibration = maintenant;
      navigator.vibrate?.([300, 100, 300, 100, 300]);
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

  /**
   * Prépare le son pendant un geste de l'utilisateur : sans ça, iPhone et Android
   * refusent de le jouer plus tard, quand le minuteur arrive au bout.
   */
  private preparerSon(): void {
    if (typeof Audio === 'undefined') return;
    // Safari 17+ : la sonnerie passe même en mode silencieux, comme une vidéo.
    const session = (navigator as { audioSession?: { type: string } }).audioSession;
    if (session) session.type = 'playback';
    if (!this.lecteur) {
      this.lecteur = new Audio(URL.createObjectURL(creerSonAlarme()));
      this.lecteur.loop = true;
      this.lecteur.preload = 'auto';
    }
    if (this.sonnerie() || this.finTest) return;
    // Lecture muette d'un instant, juste pour que le navigateur autorise le son.
    const lecteur = this.lecteur;
    lecteur.muted = true;
    // Les vieux navigateurs ne renvoient pas de promesse.
    Promise.resolve(lecteur.play())
      .then(() => {
        if (this.sonnerie()) return;
        lecteur.pause();
        lecteur.currentTime = 0;
      })
      .catch(() => {})
      .finally(() => (lecteur.muted = false));
  }

  private sonner(): void {
    const lecteur = this.lecteur;
    if (!lecteur) return;
    clearTimeout(this.finTest);
    this.finTest = undefined;
    lecteur.muted = false;
    lecteur.currentTime = 0;
    Promise.resolve(lecteur.play()).catch(() => {});
  }

  private taireSiFini(): void {
    if (this.sonnerie() || this.finTest) return;
    this.lecteur?.pause();
  }

  /** Fait entendre la sonnerie 3 secondes, pour régler le volume. */
  testerSonnerie(): void {
    this.preparerSon();
    if (this.sonnerie()) return;
    this.sonner();
    this.finTest = setTimeout(() => {
      this.finTest = undefined;
      this.taireSiFini();
    }, 3200);
  }
}
