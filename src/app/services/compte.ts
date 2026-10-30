import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { FIREBASE_CONFIG } from '../firebase.config';
import { DonneesCompte, fusionner } from '../utils/fusion';
import { Compteur } from './compteur';
import { Favoris } from './favoris';
import { Frigo } from './frigo';

export interface Utilisateur {
  uid: string;
  nom: string | null;
  email: string | null;
}

export type EtatSynchro = 'a-jour' | 'en-cours' | 'erreur';

/** Délai avant d'envoyer une modification, pour regrouper les clics rapprochés. */
const DELAI_ENVOI = 800;

/** Collection Firestore : un document par utilisateur, à son identifiant. */
const COLLECTION = 'utilisateurs';

/** Messages d'erreur de Firebase, en clair. */
const ERREURS: Record<string, string> = {
  'auth/invalid-email': "Cette adresse e-mail n'est pas valide.",
  'auth/missing-password': 'Indique ton mot de passe.',
  'auth/weak-password': 'Choisis un mot de passe d’au moins 6 caractères.',
  'auth/email-already-in-use': 'Un compte existe déjà avec cette adresse. Connecte-toi.',
  'auth/invalid-credential': 'E-mail ou mot de passe incorrect.',
  'auth/wrong-password': 'E-mail ou mot de passe incorrect.',
  'auth/user-not-found': 'Aucun compte avec cette adresse.',
  'auth/too-many-requests': 'Trop d’essais. Attends quelques minutes avant de réessayer.',
  'auth/network-request-failed': 'Pas de connexion internet.',
  'auth/popup-blocked': 'Le navigateur a bloqué la fenêtre Google. Autorise-la et réessaie.',
  'auth/popup-closed-by-user': 'Connexion Google annulée.',
  'auth/cancelled-popup-request': 'Connexion Google annulée.',
  'auth/requires-recent-login': 'Par sécurité, déconnecte-toi, reconnecte-toi puis réessaie.',
  'auth/unauthorized-domain': "Ce site n'est pas encore autorisé dans Firebase.",
};

export function messageErreur(erreur: unknown): string {
  const code = (erreur as { code?: string })?.code ?? '';
  return ERREURS[code] ?? 'Une erreur est survenue. Réessaie dans un instant.';
}

/**
 * Compte facultatif : connexion par e-mail ou Google, et sauvegarde des favoris,
 * du frigo et du compteur pour les retrouver sur tous ses appareils.
 * Firebase n'est chargé que si les comptes sont configurés.
 */
@Injectable({ providedIn: 'root' })
export class Compte {
  private readonly favoris = inject(Favoris);
  private readonly frigo = inject(Frigo);
  private readonly compteur = inject(Compteur);

  /** Faux tant que `firebase.config.ts` n'est pas rempli. */
  readonly actif = !!FIREBASE_CONFIG.apiKey;
  readonly utilisateur = signal<Utilisateur | null>(null);
  /** Vrai une fois qu'on sait si quelqu'un est connecté. */
  readonly pret = signal(!this.actif);
  readonly synchro = signal<EtatSynchro>('a-jour');

  private readonly donneesLocales = computed<DonneesCompte>(() => ({
    favoris: this.favoris.etat(),
    frigo: this.frigo.etat(),
    compteur: this.compteur.etat(),
  }));

  private firebase?: {
    auth: typeof import('firebase/auth');
    store: typeof import('firebase/firestore');
    instanceAuth: Auth;
    db: Firestore;
  };
  /** Vrai une fois les données du compte reçues et fusionnées avec celles de l'appareil. */
  private readonly recu = signal(false);
  /** Dernières données connues côté compte, pour ne pas renvoyer ce qui y est déjà. */
  private dernierEnvoi = '';
  private arreterEcoute?: () => void;
  private minuterie?: ReturnType<typeof setTimeout>;

  constructor() {
    if (!this.actif) return;
    void this.demarrer();

    // Chaque modification faite sur l'appareil part dans le compte.
    effect(() => {
      const donnees = this.donneesLocales();
      const utilisateur = this.utilisateur();
      if (!utilisateur || !this.recu()) return;
      untracked(() => this.envoyer(utilisateur.uid, donnees));
    });
  }

  private async demarrer(): Promise<void> {
    const [{ initializeApp }, auth, store] = await Promise.all([
      import('firebase/app'),
      import('firebase/auth'),
      import('firebase/firestore'),
    ]);
    const app = initializeApp(FIREBASE_CONFIG);
    const instanceAuth = auth.getAuth(app);
    instanceAuth.languageCode = 'fr';
    this.firebase = { auth, store, instanceAuth, db: store.getFirestore(app) };

    auth.onAuthStateChanged(instanceAuth, (u) => {
      this.arreterEcoute?.();
      this.recu.set(false);
      this.dernierEnvoi = '';
      this.utilisateur.set(u ? { uid: u.uid, nom: u.displayName, email: u.email } : null);
      this.pret.set(true);
      if (u) this.ecouter(u.uid);
    });
  }

  /** Suit le document du compte : modifications faites sur les autres appareils comprises. */
  private ecouter(uid: string): void {
    const { store, db } = this.firebase!;
    this.synchro.set('en-cours');
    this.arreterEcoute = store.onSnapshot(
      store.doc(db, COLLECTION, uid),
      (instantane) => {
        // Nos propres envois reviennent ici avant d'être confirmés : on les ignore.
        if (instantane.metadata.hasPendingWrites) return;
        const distant = instantane.data() as DonneesCompte | undefined;

        if (!this.recu()) {
          // Première réception : on réunit l'appareil et le compte, l'effet renverra le tout.
          this.appliquer(
            distant ? fusionner(this.donneesLocales(), distant) : this.donneesLocales(),
          );
          this.dernierEnvoi = distant ? JSON.stringify(distant) : '';
          this.recu.set(true);
        } else if (distant && JSON.stringify(distant) !== this.dernierEnvoi) {
          this.dernierEnvoi = JSON.stringify(distant);
          this.appliquer(distant);
        }
        this.synchro.set('a-jour');
      },
      () => this.synchro.set('erreur'),
    );
  }

  private appliquer(donnees: DonneesCompte): void {
    this.favoris.remplacer(donnees.favoris);
    this.frigo.remplacer(donnees.frigo);
    this.compteur.remplacer(donnees.compteur);
  }

  private envoyer(uid: string, donnees: DonneesCompte): void {
    // Firestore refuse les champs « undefined » : le passage en JSON les retire.
    const json = JSON.stringify(donnees);
    if (json === this.dernierEnvoi) return;
    clearTimeout(this.minuterie);
    this.synchro.set('en-cours');
    this.minuterie = setTimeout(async () => {
      const { store, db } = this.firebase!;
      try {
        this.dernierEnvoi = json;
        await store.setDoc(store.doc(db, COLLECTION, uid), JSON.parse(json));
        this.synchro.set('a-jour');
      } catch {
        this.dernierEnvoi = '';
        this.synchro.set('erreur');
      }
    }, DELAI_ENVOI);
  }

  async creerCompte(email: string, motDePasse: string, nom: string): Promise<void> {
    const { auth, instanceAuth } = await this.charge();
    const { user } = await auth.createUserWithEmailAndPassword(instanceAuth, email, motDePasse);
    if (nom) {
      await auth.updateProfile(user, { displayName: nom });
      this.utilisateur.set({ uid: user.uid, nom, email: user.email });
    }
  }

  async connecter(email: string, motDePasse: string): Promise<void> {
    const { auth, instanceAuth } = await this.charge();
    await auth.signInWithEmailAndPassword(instanceAuth, email, motDePasse);
  }

  async connecterAvecGoogle(): Promise<void> {
    const { auth, instanceAuth } = await this.charge();
    await auth.signInWithPopup(instanceAuth, new auth.GoogleAuthProvider());
  }

  async envoyerReinitialisation(email: string): Promise<void> {
    const { auth, instanceAuth } = await this.charge();
    await auth.sendPasswordResetEmail(instanceAuth, email);
  }

  /** Les données restent sur l'appareil après la déconnexion. */
  async deconnecter(): Promise<void> {
    const { auth, instanceAuth } = await this.charge();
    clearTimeout(this.minuterie);
    await auth.signOut(instanceAuth);
  }

  /** Supprime les données du compte puis le compte ; l'appareil garde les siennes. */
  async supprimerCompte(): Promise<void> {
    const { auth, store, instanceAuth, db } = await this.charge();
    const user = instanceAuth.currentUser;
    if (!user) return;
    clearTimeout(this.minuterie);
    this.arreterEcoute?.();
    try {
      await store.deleteDoc(store.doc(db, COLLECTION, user.uid));
      await auth.deleteUser(user);
    } catch (erreur) {
      // Le compte n'a pas pu être supprimé : on y remet les données de l'appareil.
      this.recu.set(false);
      this.dernierEnvoi = '';
      this.ecouter(user.uid);
      throw erreur;
    }
  }

  private async charge() {
    if (!this.firebase) throw { code: 'non-configure' };
    return this.firebase;
  }
}
