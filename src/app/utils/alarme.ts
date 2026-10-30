/** Fréquence d'échantillonnage du son généré. */
const ECHANTILLONS_PAR_SECONDE = 22_050;

/**
 * Fabrique le son de l'alarme (un fichier WAV) : des salves de bips aigus et
 * riches, comme un réveil de cuisine, puis un court silence avant de recommencer.
 * Joué par un lecteur audio classique, il passe même en mode silencieux sur iPhone.
 */
export function creerSonAlarme(): Blob {
  const duree = 1.6;
  const total = Math.floor(duree * ECHANTILLONS_PAR_SECONDE);
  const signal = new Float32Array(total);

  // Deux salves de 4 bips rapides sur deux notes, puis le silence jusqu'à la boucle suivante.
  const bips: { debut: number; frequence: number }[] = [];
  for (const salve of [0, 0.6]) {
    for (let i = 0; i < 4; i++) {
      bips.push({ debut: salve + i * 0.12, frequence: i % 2 ? 2093 : 1568 });
    }
  }
  const longueurBip = 0.09;

  for (const { debut, frequence } of bips) {
    const premier = Math.floor(debut * ECHANTILLONS_PAR_SECONDE);
    const nombre = Math.floor(longueurBip * ECHANTILLONS_PAR_SECONDE);
    for (let n = 0; n < nombre && premier + n < total; n++) {
      const t = n / ECHANTILLONS_PAR_SECONDE;
      // Montée et descente très courtes, pour éviter les claquements.
      const enveloppe = Math.min(1, n / 60, (nombre - n) / 60);
      // Fondamentale et harmoniques impaires : un son « carré », perçant mais pas sale.
      const onde =
        Math.sin(2 * Math.PI * frequence * t) +
        Math.sin(2 * Math.PI * 3 * frequence * t) / 3 +
        Math.sin(2 * Math.PI * 5 * frequence * t) / 5;
      signal[premier + n] = enveloppe * onde;
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
