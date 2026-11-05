import type { Lang } from '@/game/progress';

const T = {
  vi: {
    tagline: 'Chọn một World để làm quiz', left: (n: number, all: number) => `Chưa làm ${n}/${all} câu`,
    start: (n: number) => `Làm ${n} câu`, roundDone: 'Đã làm hết câu của World này',
    back: 'Về danh sách World', qn: (i: number, n: number) => `Câu ${i}/${n}`,
    right: 'ĐÚNG', wrong: 'SAI', src: 'Nguồn slide', next: 'Câu tiếp', finish: 'Xem kết quả',
    scored: (a: number, b: number) => `Đúng ${a}/${b} câu`,
    pass: 'Qua màn!', needMore: (k: number) => `Thiếu ${k} câu đúng để hạ quái và qua màn.`, short: 'Lượt dưới 5 câu có XP nhưng không tính qua màn.',
    day: 'Ngày', night: 'Đêm',
    hp: 'Máu của quái', streak: 'Streak', nextMult: 'Đòn tới',
    shot: (d: number, s: number, name: string, hp: number) => `Trúng ${d} sát thương, streak ${s}, ${name} còn ${hp} máu.`,
    miss: 'Trượt, streak về 0.', defeated: (name: string) => `Đã hạ ${name}!`, survived: (name: string, hp: number) => `${name} còn ${hp} HP`,
    bestStreak: (n: number) => `Streak dài nhất: ${n}`,
  },
  en: {
    tagline: 'Pick a World to start a quiz', left: (n: number, all: number) => `${n}/${all} questions left`,
    start: (n: number) => `Start ${n} questions`, roundDone: 'No questions left in this World',
    back: 'Back to Worlds', qn: (i: number, n: number) => `Question ${i}/${n}`,
    right: 'CORRECT', wrong: 'WRONG', src: 'Slide source', next: 'Next question', finish: 'See results',
    scored: (a: number, b: number) => `${a}/${b} correct`,
    pass: 'Level clear!', needMore: (k: number) => `${k} more right answers to beat the monster and pass.`, short: 'Runs under 5 questions earn XP but do not count as a pass.',
    day: 'Day', night: 'Night',
    hp: 'Monster health', streak: 'Streak', nextMult: 'Next hit',
    shot: (d: number, s: number, name: string, hp: number) => `Hit for ${d} damage, streak ${s}, ${name} has ${hp} health left.`,
    miss: 'Missed, streak back to 0.', defeated: (name: string) => `${name} defeated!`, survived: (name: string, hp: number) => `${name} has ${hp} HP left`,
    bestStreak: (n: number) => `Longest streak: ${n}`,
  },
};
export type Strings = typeof T.vi;
export const strings = (lang: Lang): Strings => T[lang];
