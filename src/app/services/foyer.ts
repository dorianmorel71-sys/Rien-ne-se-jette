import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { aujourdhui } from '../utils/date';
import { fusionnerFrigo } from '../utils/fusion';
import { jsonStable } from '../utils/json';
import { ecrire, lire } from '../utils/stockage';
import { Compte, Utilisateur } from './compte';
import { Frigo, Rangement } from './frigo';

/** Collection Firestore des foyers : membres et frigo commun. */
const COLLECTION = 'foyers';
/** Invitation reçue avant d'être connecté, gardée pour plus tard. */
const CLE_INVITATION = 'rien-ne-se-jette.invitation';
const DELAI_ENVOI = 800;

interface DocumentFoyer {
  membres: string[];
  /** Prénom (ou début d'e-mail) de chaque membre, par identifiant. */
  noms: Record<string, string>;
  frigo: Rangement[];
  creeLe: string;
}

export interface Membre {
  uid: string;
  nom: string;
  moi: boolean;
}

function nomAffiche(u: Utilisateur): string {
  return u.nom || u.email?.split('@')[0] || 'Quelqu’un';
}

/**
 * Frigo partagé entre plusieurs comptes (couple, famille, colocation).
 * Tant qu'on est dans un foyer, le frigo affiché est celui du foyer.
 */
@Injectable({ providedIn: 'root' })
export class Foyer {
  private readonly compte = inject(Compte);
  private readonly frigo = inject(Frigo);

  readonly id = this.compte.foyerId;
  readonly membres = signal<Membre[]>([]);
  /** Les autres membres, pour « partagé avec Léa et Sam ». */
  readonly autres = computed(() => this.membres().filter((m) => !m.moi));
  /** Invitation en attente (reçue avant d'être connecté). */
  readonly invitation = signal<string | null>(lire<string | null>(CLE_INVITATION, null));

  readonly lienInvitation = computed(() => {
    const id = this.id();
    return id ? `${location.origin}${location.pathname}#/foyer/${id}` : '';
  });

  private readonly recu = signal(false);
  /** Vrai juste après avoir rejoint : le frigo de l'appareil s'ajoute à celui du foyer. */
  private reunirAuPremier = false;
  private dernierEnvoi = '';
  private arreterEcoute?: () => void;
  private minuterie?: ReturnType<typeof setTimeout>;

  constructor() {
    effect(() => {
      const id = this.id();
      const utilisateur = this.compte.utilisateur();
      untracked(() => this.suivre(id, utilisateur));
    });

    // Chaque modification du frigo part dans le foyer.
    effect(() => {
      const frigo = this.frigo.etat();
      const id = this.id();
      if (!id || !this.recu()) return;
      untracked(() => this.envoyer(id, frigo));
    });
  }

  private async suivre(id: string | null, utilisateur: Utilisateur | null): Promise<void> {
    this.arreterEcoute?.();
    this.arreterEcoute = undefined;
    clearTimeout(this.minuterie);
    this.recu.set(false);
    this.dernierEnvoi = '';
    if (!id || !utilisateur) {
      this.membres.set([]);
      return;
    }

    const { store, db } = await this.compte.outils();
    this.arreterEcoute = store.onSnapshot(
      store.doc(db, COLLECTION, id),
      (instantane) => {
        if (instantane.metadata.hasPendingWrites) return;
        const foyer = instantane.data() as DocumentFoyer | undefined;
        if (!foyer) {
          // Le foyer a été supprimé : on revient à un frigo personnel.
          void this.compte.definirFoyer(null);
          return;
        }
        this.membres.set(
          foyer.membres.map((uid) => ({
            uid,
            nom: foyer.noms?.[uid] ?? 'Quelqu’un',
            moi: uid === utilisateur.uid,
          })),
        );

        const frigo = foyer.frigo ?? [];
        if (!this.recu()) {
          this.dernierEnvoi = jsonStable(frigo);
          this.frigo.remplacer(
            this.reunirAuPremier ? fusionnerFrigo(this.frigo.etat(), frigo) : frigo,
          );
          this.reunirAuPremier = false;
          this.recu.set(true);
        } else if (jsonStable(frigo) !== this.dernierEnvoi) {
          this.dernierEnvoi = jsonStable(frigo);
          this.frigo.remplacer(frigo);
        }
      },
      // Plus membre (ou foyer supprimé entre-temps) : retour au frigo personnel.
      (erreur) => {
        if ((erreur as { code?: string }).code === 'permission-denied') {
          void this.compte.definirFoyer(null);
        }
      },
    );
  }

  private envoyer(id: string, frigo: Rangement[]): void {
    const json = jsonStable(frigo);
    if (json === this.dernierEnvoi) return;
    clearTimeout(this.minuterie);
    this.minuterie = setTimeout(async () => {
      const { store, db } = await this.compte.outils();
      try {
        this.dernierEnvoi = json;
        await store.updateDoc(store.doc(db, COLLECTION, id), { frigo: JSON.parse(json) });
      } catch {
        this.dernierEnvoi = '';
        this.compte.synchro.set('erreur');
      }
    }, DELAI_ENVOI);
  }

  /** Crée un foyer avec le frigo de l'appareil. */
  async creer(): Promise<void> {
    const { store, db } = await this.compte.outils();
    const utilisateur = this.compte.utilisateur();
    if (!utilisateur) return;
    const ref = store.doc(store.collection(db, COLLECTION));
    const foyer: DocumentFoyer = {
      membres: [utilisateur.uid],
      noms: { [utilisateur.uid]: nomAffiche(utilisateur) },
      frigo: JSON.parse(JSON.stringify(this.frigo.etat())),
      creeLe: aujourdhui(),
    };
    await store.setDoc(ref, foyer);
    await this.compte.definirFoyer(ref.id);
  }

  /** Rejoint un foyer par son lien d'invitation ; le frigo de l'appareil s'y ajoute. */
  async rejoindre(id: string): Promise<void> {
    const { store, db } = await this.compte.outils();
    const utilisateur = this.compte.utilisateur();
    if (!utilisateur || id === this.id()) return;
    if (this.id()) await this.quitter();
    try {
      await store.updateDoc(store.doc(db, COLLECTION, id), {
        membres: store.arrayUnion(utilisateur.uid),
        [`noms.${utilisateur.uid}`]: nomAffiche(utilisateur),
      });
    } catch (erreur) {
      const code = (erreur as { code?: string }).code;
      // Un foyer qui n'existe pas (ou plus) ressort en « not-found » ou en refus.
      throw code === 'not-found' || code === 'permission-denied'
        ? { code: 'foyer/introuvable' }
        : erreur;
    }
    this.reunirAuPremier = true;
    this.oublierInvitation();
    await this.compte.definirFoyer(id);
  }

  /** Quitte le foyer : on garde une copie du frigo, qui redevient personnel. */
  async quitter(): Promise<void> {
    const id = this.id();
    const utilisateur = this.compte.utilisateur();
    if (!id || !utilisateur) return;
    const { store, db } = await this.compte.outils();
    const ref = store.doc(db, COLLECTION, id);
    clearTimeout(this.minuterie);
    this.arreterEcoute?.();
    this.arreterEcoute = undefined;
    if (this.autres().length === 0) {
      await store.deleteDoc(ref);
    } else {
      await store.updateDoc(ref, {
        membres: store.arrayRemove(utilisateur.uid),
        [`noms.${utilisateur.uid}`]: store.deleteField(),
      });
    }
    await this.compte.definirFoyer(null);
  }

  garderInvitation(id: string): void {
    this.invitation.set(id);
    ecrire(CLE_INVITATION, id);
  }

  oublierInvitation(): void {
    this.invitation.set(null);
    ecrire(CLE_INVITATION, null);
  }
}
