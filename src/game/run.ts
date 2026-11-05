import { PASS, MIN_RUN, batchSize, shuffle } from './rules';

export type Question = {
  id: string; w: number; q: string; o: string[]; a: number;
  vi: string; en: string; src: string; ng?: number;
};
export type RunItem = { q: Question; order: number[]; pick: number | null };
export type Run = { w: number; i: number; items: RunItem[] };

export function startRun(w: number, bank: Question[], seen: string[], random: () => number = Math.random): Run {
  const done = new Set(seen);
  const left = bank.filter(q => q.w === w && !done.has(q.id));
  const picked = shuffle(left, random).slice(0, batchSize(left.length));
  return { w, i: 0, items: picked.map(q => ({ q, order: shuffle(q.o.map((_, k) => k), random), pick: null })) };
}

export function pick(run: Run, option: number): Run {
  if (run.items[run.i].pick !== null) return run;
  return { ...run, items: run.items.map((it, k) => (k === run.i ? { ...it, pick: option } : it)) };
}

export const isRight = (it: RunItem) => it.pick === it.q.a;
export const score = (run: Run) => run.items.filter(isRight).length;

// A short run still earns XP but does not count as a pass.
export const passed = (run: Run) => run.items.length >= MIN_RUN && score(run) / run.items.length >= PASS;
