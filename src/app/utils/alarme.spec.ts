import { creerSonAlarme } from './alarme';

describe('creerSonAlarme', () => {
  it('produit un WAV de 1,6 s qui sonne fort sans saturer', async () => {
    const son = creerSonAlarme();
    const octets = new DataView(await son.arrayBuffer());
    const texte = (debut: number) =>
      String.fromCharCode(...[0, 1, 2, 3].map((i) => octets.getUint8(debut + i)));
    expect(texte(0)).toBe('RIFF');
    expect(texte(8)).toBe('WAVE');
    expect(octets.byteLength).toBe(44 + Math.floor(1.6 * 22_050) * 2);

    let pic = 0;
    for (let i = 44; i < octets.byteLength; i += 2)
      pic = Math.max(pic, Math.abs(octets.getInt16(i, true)));
    expect(pic).toBeGreaterThan(20_000);
    expect(pic).toBeLessThan(32_767);
  });
});
