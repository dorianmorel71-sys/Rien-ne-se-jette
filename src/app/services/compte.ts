import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { FIREBASE_CONFIG } from '../firebase.config';
import { DonneesCompte, fusionner } from '../utils/fusion';
import { jsonStable } from '../utils/json';
import { ecrire, lire } from '../utils/stockage';
import { Compteur } from './compteur';
import { Favoris } from './favoris';
import { Frigo } from './frigo';

export interface Utilisateur {
  uid: string;
  nom: string | null;
  email: string | null;
  /** Date de création du compte, telle que Firebase la donne. */
  creeLe?: string;
}

export type EtatSynchro = 'a-jour' | 'en-cours' | 'erreur';

/** Délai avant d'envoyer une modification, pour regrouper les clics rapprochés. */
const DELAI_ENVOI = 800;

/** Collection Firestore : un document par utilisateur, à son identifiant. */
const COLLECTION = 'utilisateurs';

/**
 * Compte déjà réuni avec les données de cet appareil. On ne réunit qu'une fois :
 * ensuite le compte fait foi, sinon un favori retiré ailleurs reviendrait.
 */
const CLE_REUNI = 'rien-ne-se-jette.compte-reuni';

/** Le document du compte : les données, et le foyer dont on partage le frigo. */
type DocumentCompte = Partial<DonneesCompte> & { foyer?: string };

/** Ce qu'on envoie : sans le frigo quand il est partagé, il vit alors dans le foyer. */
type DonneesEnvoyees = Omit<DonneesCompte, 'frigo'> & { frigo?: DonneesCompte['frigo'] };

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
  'foyer/introuvable': "Cette invitation n'existe plus. Demande un nouveau lien.",
  'permission-denied': 'Accès refusé par Firebase : les règles de la base ne sont pas à jour.',
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
  /** Prénom, ou début de l'e-mail : pour le menu et le titre du compte. */
  readonly nomAffiche = computed(() => {
    const u = this.utilisateur();
    return u ? u.nom || u.email?.split('@')[0] || 'Mon compte' : null;
  });
  readonly initiale = computed(() => this.nomAffiche()?.[0]?.toUpperCase() ?? null);

  /** Foyer dont on partage le frigo, lu dans le document du compte. */
  readonly foyerId = signal<string | null>(null);

  private readonly donneesLocales = computed<DonneesEnvoyees>(() => ({
    favoris: this.favoris.etat(),
    compteur: this.compteur.etat(),
    ...(this.foyerId() ? {} : { frigo: this.frigo.etat() }),
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
      this.utilisateur.set(
        u
          ? { uid: u.uid, nom: u.displayName, email: u.email, creeLe: u.metadata.creationTime }
          : null,
      );
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
        const document = instantane.data() as DocumentCompte | undefined;
        this.foyerId.set(document?.foyer ?? null);
        const distant = document && this.extraire(document);

        if (!this.recu()) {
          if (!distant) {
            // Nouveau compte : l'effet y enverra les données de l'appareil.
            this.dernierEnvoi = '';
          } else if (lire(CLE_REUNI, '') === uid) {
            this.dernierEnvoi = jsonStable(distant);
            this.appliquer(distant);
          } else {
            // Première connexion sur cet appareil : on réunit, l'effet renverra le tout.
            this.dernierEnvoi = jsonStable(distant);
            this.appliquer(
              fusionner(this.completer(this.donneesLocales()), this.completer(distant)),
            );
          }
          ecrire(CLE_REUNI, uid);
          this.recu.set(true);
        } else if (distant && jsonStable(distant) !== this.dernierEnvoi) {
          this.dernierEnvoi = jsonStable(distant);
          this.appliquer(distant);
        }
        this.synchro.set('a-jour');
      },
      () => this.synchro.set('erreur'),
    );
  }

  /** Les données du document, sans le frigo s'il est partagé dans un foyer. */
  private extraire(document: DocumentCompte): DonneesEnvoyees {
    const { favoris, compteur, frigo } = this.completer(document);
    return { favoris, compteur, ...(document.foyer ? {} : { frigo }) };
  }

  /** Remplit les champs absents, par exemple dans un compte créé avant un ajout. */
  private completer(donnees: Partial<DonneesCompte>): DonneesCompte {
    return {
      favoris: donnees.favoris ?? { legumes: [], recettes: [] },
      compteur: donnees.compteur ?? { restes: 0, recettes: 0, fois: {} },
      frigo: donnees.frigo ?? [],
    };
  }

  private appliquer(donnees: DonneesEnvoyees): void {
    this.favoris.remplacer(donnees.favoris);
    this.compteur.remplacer(donnees.compteur);
    // Avec un foyer, le frigo vient du foyer.
    if (donnees.frigo && !this.foyerId()) this.frigo.remplacer(donnees.frigo);
  }

  private envoyer(uid: string, donnees: DonneesEnvoyees): void {
    // Firestore refuse les champs « undefined » : le passage en JSON les retire.
    const json = jsonStable(donnees);
    if (json === this.dernierEnvoi) return;
    clearTimeout(this.minuterie);
    this.synchro.set('en-cours');
    this.minuterie = setTimeout(async () => {
      const { store, db } = this.firebase!;
      try {
        this.dernierEnvoi = json;
        // Seuls les champs envoyés sont remplacés : le foyer et le frigo personnel restent.
        await store.setDoc(store.doc(db, COLLECTION, uid), JSON.parse(json), {
          mergeFields: Object.keys(donnees),
        });
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
      this.utilisateur.set({
        uid: user.uid,
        nom,
        email: user.email,
        creeLe: user.metadata.creationTime,
      });
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
    // À la prochaine connexion, ce qui aura été fait entre-temps sera réuni avec le compte.
    ecrire(CLE_REUNI, '');
    await auth.signOut(instanceAuth);
  }

  /** Enregistre dans le compte le foyer dont on partage le frigo (ou aucun). */
  async definirFoyer(id: string | null): Promise<void> {
    const { store, db } = await this.charge();
    const uid = this.utilisateur()?.uid;
    if (!uid) return;
    await store.setDoc(
      store.doc(db, COLLECTION, uid),
      { foyer: id ?? store.deleteField() },
      { merge: true },
    );
    this.foyerId.set(id);
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

  /** Firebase, une fois chargé : pour le service du foyer. */
  outils() {
    return this.charge();
  }

  private async charge() {
    if (!this.firebase) throw { code: 'non-configure' };
    return this.firebase;
  }
}
