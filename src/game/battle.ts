import { PASS } from './rules';
import { isRight, type Run } from './run';

export const BASE_DAMAGE = 10;
// Health per question. Together with the lock below, this keeps "monster down" and "passed" the same event.
export const HP_PER_QUESTION = 9;

// Bigger streak, bigger shot: x1 for streak 1-2, x1.5 for 3-4, x2 from 5.
export const multiplierFor = (streak: number) => (streak >= 5 ? 2 : streak >= 3 ? 1.5 : 1);
export const damageFor = (streak: number) => BASE_DAMAGE * multiplierFor(streak);
export const tierFor = (streak: number) => (streak >= 5 ? 3 : streak >= 3 ? 2 : 1);

export const monsterHp = (n: number) => n * HP_PER_QUESTION;

// Smallest number of right answers that reaches PASS. The epsilon keeps 0.8 * 15 from rounding up to 13.
export const needFor = (n: number) => Math.ceil(n * PASS - 1e-9);

export type Battle = {
  maxHp: number; hp: number; need: number; right: number;
  streak: number; best: number;
  // The answer on screen: its damage, and the streak that produced it. Zero when it was wrong or unanswered.
  hit: number; hitStreak: number;
  down: boolean;
};

// Streak damage depends on answer order, so 7 right in a row outdamages 8 spread out. To keep the result fair the
// monster stays on 1 HP until the learner has enough right answers to pass, and falls on exactly that answer.
export function battleOf(run: Run): Battle {
  const n = run.items.length, need = needFor(n), maxHp = monsterHp(n);
  let hp = maxHp, right = 0, streak = 0, best = 0, hit = 0, hitStreak = 0;
  for (let k = 0; k <= run.i && k < n; k++) {
    const it = run.items[k];
    hit = 0; hitStreak = 0;
    if (it.pick === null) continue;
    if (isRight(it)) {
      streak++; right++;
      best = Math.max(best, streak);
      hit = damageFor(streak); hitStreak = streak;
      hp -= hit;
    } else streak = 0;
    hp = right >= need ? 0 : Math.max(hp, 1);
  }
  return { maxHp, hp, need, right, streak, best, hit, hitStreak, down: right >= need };
}
