import { creerSonAlarme, SONNERIES } from './alarme';

async function analyser(son: Blob) {
  const octets = new DataView(await son.arrayBuffer());
  const texte = (debut: number) =>
    String.fromCharCode(...[0, 1, 2, 3].map((i) => octets.getUint8(debut + i)));
  let pic = 0;
  for (let i = 44; i < octets.byteLength; i += 2) {
    pic = Math.max(pic, Math.abs(octets.getInt16(i, true)));
  }
  return { entete: texte(0) + texte(8), secondes: (octets.byteLength - 44) / 2 / 22_050, pic };
}

describe('creerSonAlarme', () => {
  for (const { type } of SONNERIES) {
    it(`fabrique la sonnerie « ${type} » : un WAV fort mais sans saturer`, async () => {
      const { entete, secondes, pic } = await analyser(creerSonAlarme(type));
      expect(entete).toBe('RIFFWAVE');
      expect(secondes).toBeGreaterThan(1.5);
      expect(pic).toBeGreaterThan(30_000);
      expect(pic).toBeLessThan(32_767);
    });
  }
});
