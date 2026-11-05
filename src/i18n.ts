import type { Lang } from '@/game/progress';

const T = {
  vi: {
    tagline: 'Chọn một World để làm quiz', left: (n: number, all: number) => `Chưa làm ${n}/${all} câu`,
    start: (n: number) => `Làm ${n} câu`, roundDone: 'Đã làm hết câu của World này',
    back: 'Về danh sách World', qn: (i: number, n: number) => `Câu ${i}/${n}`,
    right: 'ĐÚNG', wrong: 'SAI', src: 'Nguồn slide', next: 'Câu tiếp', finish: 'Xem kết quả',
    result: 'Kết quả', scored: (a: number, b: number) => `Đúng ${a}/${b} câu`,
    pass: 'QUA MÀN!', fail: 'Chưa đạt 80%, làm thêm một lượt nhé.', short: 'Lượt dưới 5 câu có XP nhưng không tính qua màn.',
    day: 'Ngày', night: 'Đêm',
  },
  en: {
    tagline: 'Pick a World to start a quiz', left: (n: number, all: number) => `${n}/${all} questions left`,
    start: (n: number) => `Start ${n} questions`, roundDone: 'No questions left in this World',
    back: 'Back to Worlds', qn: (i: number, n: number) => `Question ${i}/${n}`,
    right: 'CORRECT', wrong: 'WRONG', src: 'Slide source', next: 'Next question', finish: 'See results',
    result: 'Results', scored: (a: number, b: number) => `${a}/${b} correct`,
    pass: 'LEVEL CLEAR!', fail: 'Below 80%, try another run.', short: 'Runs under 5 questions earn XP but do not count as a pass.',
    day: 'Day', night: 'Night',
  },
};
export type Strings = typeof T.vi;
export const strings = (lang: Lang): Strings => T[lang];
