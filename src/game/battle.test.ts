import { describe, expect, it } from 'vitest';
import { battleOf, damageFor, monsterHp, needFor } from './battle';
import { PASS } from './rules';
import { passed, type Run } from './run';

// '1' right, '0' wrong, '.' not answered yet.
function runOf(seq: string, i = seq.length - 1): Run {
  return {
    w: 2, i,
    items: [...seq].map((c, k) => ({
      q: { id: `q${k}`, w: 2, q: '', o: ['a', 'b'], a: 0, vi: '', en: '', src: '' },
      order: [0, 1],
      pick: c === '.' ? null : c === '1' ? 0 : 1,
    })),
  };
}
const hpAfter = (seq: string) => [...seq].map((_, k) => battleOf(runOf(seq, k)).hp);

describe('battle', () => {
  it('scales health with the number of questions', () => {
    expect(monsterHp(5)).toBe(45);
    expect(monsterHp(10)).toBe(90);
    expect(monsterHp(14)).toBe(126);
  });

  it('raises damage with the streak', () => {
    expect([1, 2, 3, 4, 5, 9].map(damageFor)).toEqual([10, 10, 15, 15, 20, 20]);
  });

  it('needs the same number of right answers as the pass rule', () => {
    for (let n = 1; n <= 40; n++) {
      const smallest = Array.from({ length: n + 1 }, (_, k) => k).find(k => k / n >= PASS);
      expect(needFor(n)).toBe(smallest);
    }
  });

  it('plays out a perfect run, locked at 1 HP until the pass count', () => {
    expect(hpAfter('1111111111')).toEqual([80, 70, 55, 40, 20, 1, 1, 0, 0, 0]);
  });

  it('brings the monster down on the last right answer of a spread-out 8/10', () => {
    expect(hpAfter('1110111011')).toEqual([80, 70, 55, 55, 45, 35, 20, 20, 10, 0]);
  });

  it('lets the monster survive on 1 HP after 7 in a row', () => {
    const b = battleOf(runOf('1111111000'));
    expect(b.hp).toBe(1);
    expect(b.down).toBe(false);
    expect(b.best).toBe(7);
    expect(b.streak).toBe(0);
  });

  it('resets the streak and deals no damage on a wrong answer', () => {
    const b = battleOf(runOf('1110......', 3));
    expect(b).toMatchObject({ hp: 55, streak: 0, hit: 0, best: 3 });
  });

  it('ignores the question on screen until it is answered', () => {
    expect(battleOf(runOf('11........', 2))).toMatchObject({ hp: 70, streak: 2, hit: 0 });
  });

  it('agrees with the pass rule for every sequence of a 10-question run', () => {
    for (let mask = 0; mask < 1 << 10; mask++) {
      const seq = Array.from({ length: 10 }, (_, k) => (mask >> k) & 1).join('');
      expect(battleOf(runOf(seq)).down).toBe(passed(runOf(seq)));
    }
  });
});
