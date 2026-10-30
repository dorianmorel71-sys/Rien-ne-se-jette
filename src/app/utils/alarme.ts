/** Fréquence d'échantillonnage du son généré. */
const ECHANTILLONS_PAR_SECONDE = 22_050;

export type TypeSonnerie = 'carillon' | 'marimba' | 'bips';

export const SONNERIES: { type: TypeSonnerie; nom: string }[] = [
  { type: 'carillon', nom: 'Carillon' },
  { type: 'marimba', nom: 'Marimba' },
  { type: 'bips', nom: 'Bips' },
];

/** Une note : quand elle commence, sa hauteur, et le timbre de l'instrument. */
interface Note {
  debut: number;
  frequence: number;
}

interface Timbre {
  /** Harmoniques : rapport à la fréquence de la note et volume relatif. */
  partiels: { rapport: number; volume: number }[];
  /** Vitesse à laquelle le son s'éteint (plus c'est grand, plus c'est sec). */
  extinction: number;
  /** Durée de chaque note, en secondes. */
  duree: number;
}

const DO6 = 1047;
const MI6 = 1319;
const SOL6 = 1568;
const DO7 = 2093;
const SOL5 = 784;

/** Les sonneries : des notes qui tournent en boucle, puis un silence. */
const MOTIFS: Record<TypeSonnerie, { longueur: number; notes: Note[]; timbre: Timbre }> = {
  // Cloches qui montent en arpège : douces mais claires.
  carillon: {
    longueur: 2.4,
    notes: [DO6, MI6, SOL6, DO7].map((frequence, i) => ({ debut: i * 0.2, frequence })),
    timbre: {
      partiels: [
        { rapport: 1, volume: 1 },
        { rapport: 2, volume: 0.45 },
        { rapport: 3, volume: 0.2 },
        { rapport: 4.2, volume: 0.12 },
      ],
      extinction: 3.2,
      duree: 1.4,
    },
  },
  // Lames de bois, deux notes qui se répondent.
  marimba: {
    longueur: 1.8,
    notes: [SOL5, DO6, SOL5, DO6].map((frequence, i) => ({ debut: i * 0.24, frequence })),
    timbre: {
      partiels: [
        { rapport: 1, volume: 1 },
        { rapport: 3.93, volume: 0.3 },
        { rapport: 9.2, volume: 0.06 },
      ],
      extinction: 8,
      duree: 0.7,
    },
  },
  // L'alarme classique, pour ceux qui veulent l'entendre de loin.
  bips: {
    longueur: 1.6,
    notes: [0, 0.6].flatMap((salve) =>
      [0, 1, 2, 3].map((i) => ({ debut: salve + i * 0.12, frequence: i % 2 ? 2093 : 1568 })),
    ),
    timbre: {
      partiels: [
        { rapport: 1, volume: 1 },
        { rapport: 3, volume: 1 / 3 },
        { rapport: 5, volume: 1 / 5 },
      ],
      extinction: 0,
      duree: 0.09,
    },
  },
};

/**
 * Fabrique le son d'une sonnerie (un fichier WAV) qui tourne en boucle.
 * Joué par un lecteur audio classique, il passe même en mode silencieux sur iPhone.
 */
export function creerSonAlarme(type: TypeSonnerie = 'carillon'): Blob {
  const { longueur, notes, timbre } = MOTIFS[type];
  const total = Math.floor(longueur * ECHANTILLONS_PAR_SECONDE);
  const signal = new Float32Array(total);

  for (const { debut, frequence } of notes) {
    const premier = Math.floor(debut * ECHANTILLONS_PAR_SECONDE);
    const nombre = Math.floor(timbre.duree * ECHANTILLONS_PAR_SECONDE);
    for (let n = 0; n < nombre && premier + n < total; n++) {
      const t = n / ECHANTILLONS_PAR_SECONDE;
      // Attaque et fin très courtes, pour éviter les claquements.
      const bords = Math.min(1, n / 40, (nombre - n) / 40);
      let onde = 0;
      for (const { rapport, volume } of timbre.partiels) {
        // Les harmoniques aiguës s'éteignent plus vite : c'est ce qui fait le son de cloche.
        onde +=
          volume *
          Math.exp(-timbre.extinction * rapport * 0.6 * t) *
          Math.sin(2 * Math.PI * frequence * rapport * t);
      }
      signal[premier + n] += bords * onde;
    }
  }

  // Le plus fort possible sans saturer : le pic est ramené à 95 % du maximum.
  const pic = signal.reduce((max, v) => Math.max(max, Math.abs(v)), 0);
  return enWav(Int16Array.from(signal, (v) => Math.round((v / pic) * 0.95 * 32767)));
}

/** Emballe des échantillons 16 bits mono dans un fichier WAV. */
function enWav(echantillons: Int16Array<ArrayBuffer>): Blob {
  const entete = new DataView(new ArrayBuffer(44));
  const texte = (position: number, valeur: string) =>
    [...valeur].forEach((c, i) => entete.setUint8(position + i, c.charCodeAt(0)));
  const tailleDonnees = echantillons.length * 2;
  texte(0, 'RIFF');
  entete.setUint32(4, 36 + tailleDonnees, true);
  texte(8, 'WAVE');
  texte(12, 'fmt ');
  entete.setUint32(16, 16, true);
  entete.setUint16(20, 1, true); // PCM
  entete.setUint16(22, 1, true); // mono
  entete.setUint32(24, ECHANTILLONS_PAR_SECONDE, true);
  entete.setUint32(28, ECHANTILLONS_PAR_SECONDE * 2, true);
  entete.setUint16(32, 2, true);
  entete.setUint16(34, 16, true);
  texte(36, 'data');
  entete.setUint32(40, tailleDonnees, true);
  return new Blob([entete, echantillons], { type: 'audio/wav' });
}
