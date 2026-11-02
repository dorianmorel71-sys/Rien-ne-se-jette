import { inject, Injectable } from '@angular/core';
import { Compte } from './compte';

/** Collection Firestore des avis : chacun peut en écrire, personne ne peut les relire depuis l'appli. */
const COLLECTION = 'avis';

/** Longueurs maximales, les mêmes que dans firestore.rules. */
export const LONGUEUR_TEXTE = 2000;
const LONGUEUR_CHAMP = 300;

export type Humeur = 'adore' | 'bien' | 'bof' | 'bug';

export interface NouvelAvis {
  texte: string;
  humeur: Humeur | null;
  /** Pour pouvoir répondre, si la personne le souhaite. */
  email: string;
  /** Page où se trouvait la personne avant d'ouvrir le formulaire. */
  page: string;
}

/** Envoie les avis des testeurs dans Firestore, lisibles depuis la console Firebase. */
@Injectable({ providedIn: 'root' })
export class Avis {
  private readonly compte = inject(Compte);

  async envoyer(avis: NouvelAvis): Promise<void> {
    const { store, db } = await this.compte.outils();
    const uid = this.compte.utilisateur()?.uid;
    await store.addDoc(store.collection(db, COLLECTION), {
      texte: avis.texte.trim().slice(0, LONGUEUR_TEXTE),
      ...(avis.humeur ? { humeur: avis.humeur } : {}),
      ...(avis.email.trim() ? { email: avis.email.trim().slice(0, LONGUEUR_CHAMP) } : {}),
      page: avis.page.slice(0, LONGUEUR_CHAMP),
      // Pour reproduire un bug : le navigateur et la taille d'écran.
      appareil: `${navigator.userAgent} · ${window.innerWidth}×${window.innerHeight}`.slice(
        0,
        LONGUEUR_CHAMP,
      ),
      installee: matchMedia('(display-mode: standalone)').matches,
      ...(uid ? { uid } : {}),
      date: store.serverTimestamp(),
    });
  }
}
