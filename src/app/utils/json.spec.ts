import { jsonStable } from './json';

describe('jsonStable', () => {
  it("ne dépend pas de l'ordre des champs et retire les champs vides", () => {
    expect(jsonStable({ b: 1, a: { d: [2, 1], c: undefined } })).toBe(
      jsonStable({ a: { d: [2, 1] }, b: 1 }),
    );
    expect(jsonStable({ a: [2, 1] })).not.toBe(jsonStable({ a: [1, 2] }));
  });
});
