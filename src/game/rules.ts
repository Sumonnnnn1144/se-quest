// Game rules carried over from the midterm review page. The final pass rules are still open.
export const PASS = 0.8;
export const RUN_N = 10;
export const MIN_RUN = 5;
export const XP_CORRECT = 10;

export const RANKS = [
  ['Intern', 0], ['Fresher', 300], ['Junior', 700], ['Middle', 1200],
  ['Senior', 1800], ['Tech Lead', 2500], ['Architect', 3300],
] as const;

export function rankOf(xp: number) {
  let i = 0;
  RANKS.forEach((r, k) => { if (xp >= r[1]) i = k; });
  return i;
}

// Share of the way from the current rank to the next one, 0 to 100.
export function rankProgress(xp: number) {
  const i = rankOf(xp), from = RANKS[i][1], next = RANKS[i + 1]?.[1];
  return next === undefined ? 100 : Math.round((xp - from) / (next - from) * 100);
}

// A leftover of 1 to 4 questions joins the last run, so 13 left means one run of 13.
export const batchSize = (left: number) => (left <= RUN_N + MIN_RUN - 1 ? left : RUN_N);

// A level check allows one wrong answer.
export const checkNeed = (n: number) => Math.max(1, n - 1);

export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
