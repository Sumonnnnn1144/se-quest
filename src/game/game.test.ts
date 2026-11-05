import { describe, expect, it } from 'vitest';
import { batchSize, checkNeed, rankOf, rankProgress, shuffle } from './rules';
import { passed, pick, score, startRun, type Question } from './run';
import { fresh, recordAnswer } from './progress';

const bank = (n: number, w = 2): Question[] => Array.from({ length: n }, (_, k) => ({
  id: `w${w}-${k}`, w, q: `q${k}`, o: ['a', 'b', 'c', 'd'], a: 0, vi: '', en: '', src: '02#1',
}));

describe('rules', () => {
  it('folds a small leftover into the last run', () => {
    expect(batchSize(30)).toBe(10);
    expect(batchSize(15)).toBe(10);
    expect(batchSize(14)).toBe(14);
    expect(batchSize(3)).toBe(3);
  });
  it('allows one wrong answer in a level check', () => {
    expect(checkNeed(5)).toBe(4);
    expect(checkNeed(1)).toBe(1);
  });
  it('ranks at the exact threshold and caps at the top', () => {
    expect(rankOf(299)).toBe(0);
    expect(rankOf(300)).toBe(1);
    expect(rankProgress(150)).toBe(50);
    expect(rankProgress(9999)).toBe(100);
  });
  it('shuffles without losing items', () => {
    expect(shuffle([1, 2, 3, 4]).sort()).toEqual([1, 2, 3, 4]);
  });
});

describe('run', () => {
  it('only uses unseen questions of the world', () => {
    const run = startRun(2, [...bank(12), ...bank(5, 3)], ['w2-0', 'w2-1']);
    expect(run.items).toHaveLength(10);
    expect(run.items.every(it => it.q.w === 2 && it.q.id !== 'w2-0' && it.q.id !== 'w2-1')).toBe(true);
  });
  it('keeps the first answer', () => {
    const run = startRun(2, bank(5), []);
    expect(pick(pick(run, 0), 1).items[0].pick).toBe(0);
  });
  it('passes at 80%, but never on a short run', () => {
    const answer = (n: number, right: number) => {
      let run = startRun(2, bank(n), []);
      run.items.forEach((_, k) => { run = pick({ ...run, i: k }, k < right ? 0 : 1); });
      return run;
    };
    expect(score(answer(5, 4))).toBe(4);
    expect(passed(answer(5, 4))).toBe(true);
    expect(passed(answer(5, 3))).toBe(false);
    expect(passed(answer(4, 4))).toBe(false);
  });
});

describe('progress', () => {
  it('adds XP only when right and files wrong answers once', () => {
    let p = recordAnswer(fresh(), 2, 'a', true, 10);
    expect(p.xp).toBe(10);
    p = recordAnswer(recordAnswer(p, 2, 'b', false, 10), 2, 'b', false, 10);
    expect(p.xp).toBe(10);
    expect(p.wrong).toEqual(['b']);
    expect(p.seen[2]).toEqual(['a', 'b']);
  });
});
