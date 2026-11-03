// Tests des règles Firestore, sur l'émulateur local : `npm run test:regles`.
import { after, before, beforeEach, describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  setLogLevel,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';

let env;
const db = (uid) =>
  (uid ? env.authenticatedContext(uid) : env.unauthenticatedContext()).firestore();

/** Ce que l'appli envoie pour un compte : favoris, compteur et frigo. */
const DONNEES = {
  favoris: { legumes: ['carotte'], recettes: [] },
  compteur: { restes: 3, recettes: 1, fois: { 'Pesto de fanes': 1 } },
  frigo: [],
};

before(async () => {
  // Les refus attendus ne doivent pas encombrer la sortie.
  setLogLevel('silent');
  env = await initializeTestEnvironment({
    projectId: 'demo-rien-ne-se-jette',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8085 },
  });
});
beforeEach(() => env.clearFirestore());
after(() => env.cleanup());

describe('utilisateurs', () => {
  const moi = () => doc(db('alice'), 'utilisateurs/alice');

  it('chacun crée, lit et supprime son propre document', async () => {
    await assertSucceeds(setDoc(moi(), DONNEES, { mergeFields: Object.keys(DONNEES) }));
    await assertSucceeds(getDoc(moi()));
    await assertSucceeds(deleteDoc(moi()));
  });

  it('personne ne lit ni n’écrit le document d’un autre', async () => {
    await env.withSecurityRulesDisabled((c) =>
      setDoc(doc(c.firestore(), 'utilisateurs/alice'), DONNEES),
    );
    await assertFails(getDoc(doc(db('bob'), 'utilisateurs/alice')));
    await assertFails(getDoc(doc(db(), 'utilisateurs/alice')));
    await assertFails(setDoc(doc(db('bob'), 'utilisateurs/alice'), DONNEES));
    await assertFails(deleteDoc(doc(db('bob'), 'utilisateurs/alice')));
  });

  it('refuse un champ que l’appli n’utilise pas', async () => {
    await assertFails(setDoc(moi(), { ...DONNEES, admin: true }));
  });

  it('refuse un frigo trop grand', async () => {
    await assertFails(setDoc(moi(), { frigo: Array.from({ length: 501 }, () => ({})) }));
  });

  it('enregistre l’avatar choisi, aliment ou photo Google', async () => {
    await assertSucceeds(
      setDoc(moi(), { avatar: { emoji: '🥕', couleur: '#fde2d6' } }, { merge: true }),
    );
    await assertSucceeds(setDoc(moi(), { avatar: { photo: true } }, { merge: true }));
    await assertFails(
      setDoc(moi(), { avatar: { emoji: '🥕', lien: 'https://exemple.fr' } }, { merge: true }),
    );
  });

  it('enregistre l’accord pour les nouvelles avec la date du serveur, et son retrait', async () => {
    const accord = { nouvelles: { email: 'alice@exemple.fr', date: serverTimestamp() } };
    await assertSucceeds(setDoc(moi(), accord, { merge: true }));
    await assertSucceeds(setDoc(moi(), { nouvelles: deleteField() }, { merge: true }));
  });

  it('refuse un accord antidaté', async () => {
    const date = Timestamp.fromDate(new Date('2020-01-01'));
    await assertFails(
      setDoc(moi(), { nouvelles: { email: 'alice@exemple.fr', date } }, { merge: true }),
    );
  });

  it('accepte les autres modifications une fois l’accord enregistré', async () => {
    await setDoc(moi(), {
      ...DONNEES,
      nouvelles: { email: 'a@exemple.fr', date: serverTimestamp() },
    });
    await assertSucceeds(
      setDoc(moi(), { avatar: { emoji: '🍋', couleur: '#fbe8c4' } }, { merge: true }),
    );
    await assertSucceeds(
      setDoc(
        moi(),
        { ...DONNEES, compteur: { restes: 4, recettes: 2, fois: {} } },
        {
          mergeFields: Object.keys(DONNEES),
        },
      ),
    );
    await assertSucceeds(setDoc(moi(), { foyer: 'foyer-1' }, { merge: true }));
    await assertSucceeds(setDoc(moi(), { foyer: deleteField() }, { merge: true }));
  });
});

describe('avis', () => {
  const avis = (contenu, uid) => setDoc(doc(db(uid), `avis/${crypto.randomUUID()}`), contenu);
  const AVIS = {
    texte: 'Super appli !',
    humeur: 'adore',
    page: '/restes',
    date: serverTimestamp(),
  };

  it('tout le monde peut envoyer un avis, avec ou sans compte', async () => {
    await assertSucceeds(avis(AVIS));
    await assertSucceeds(avis({ ...AVIS, uid: 'alice', email: 'a@exemple.fr' }, 'alice'));
  });

  it('refuse un avis vide, trop long, mal daté ou avec un champ en trop', async () => {
    await assertFails(avis({ ...AVIS, texte: '' }));
    await assertFails(avis({ ...AVIS, texte: 'a'.repeat(2001) }));
    await assertFails(avis({ ...AVIS, date: Timestamp.fromDate(new Date('2020-01-01')) }));
    await assertFails(avis({ ...AVIS, humeur: 'génial' }));
    await assertFails(avis({ ...AVIS, note: 5 }));
  });

  it('refuse un avis signé au nom de quelqu’un d’autre', async () => {
    await assertFails(avis({ ...AVIS, uid: 'alice' }, 'bob'));
    await assertFails(avis({ ...AVIS, uid: 'alice' }));
  });

  it('personne ne relit les avis depuis l’appli', async () => {
    await env.withSecurityRulesDisabled((c) => setDoc(doc(c.firestore(), 'avis/a1'), AVIS));
    await assertFails(getDoc(doc(db('alice'), 'avis/a1')));
    await assertFails(getDoc(doc(db(), 'avis/a1')));
  });
});

describe('foyers (frigo partagé)', () => {
  const foyer = (uid) => doc(db(uid), 'foyers/f1');
  const creer = () =>
    env.withSecurityRulesDisabled((c) =>
      setDoc(doc(c.firestore(), 'foyers/f1'), {
        membres: ['alice'],
        noms: { alice: 'Alice' },
        frigo: [],
      }),
    );

  it('on crée un foyer dont on est le seul membre', async () => {
    await assertSucceeds(setDoc(foyer('alice'), { membres: ['alice'], noms: { alice: 'Alice' } }));
    await assertFails(setDoc(doc(db('bob'), 'foyers/f2'), { membres: ['bob', 'carla'], noms: {} }));
  });

  it('seuls les membres voient le foyer', async () => {
    await creer();
    await assertSucceeds(getDoc(foyer('alice')));
    await assertFails(getDoc(foyer('bob')));
  });

  it('une personne invitée ne peut que s’y ajouter elle-même', async () => {
    await creer();
    await assertSucceeds(updateDoc(foyer('bob'), { membres: ['alice', 'bob'], 'noms.bob': 'Bob' }));
    await assertFails(updateDoc(foyer('carla'), { membres: ['alice', 'bob', 'carla', 'dan'] }));
    await assertFails(updateDoc(foyer('carla'), { membres: ['carla'] }));
  });

  it('le dernier membre qui part supprime le foyer', async () => {
    await creer();
    await assertFails(deleteDoc(foyer('bob')));
    await assertSucceeds(deleteDoc(foyer('alice')));
  });
});
