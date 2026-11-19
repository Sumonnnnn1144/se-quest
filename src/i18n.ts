import type { Lang } from '@/game/progress';

const T = {
  vi: {
    left: (n: number, all: number) => `Chưa làm ${n}/${all} câu`,
    start: (n: number) => `Vào đấu ${n} câu`, roundDone: 'Đã làm hết câu của World này',
    world: (n: number) => `World ${n}`, monster: 'Quái giữ đảo', prevWorld: 'World trước', nextWorld: 'World sau',
    drag: 'Kéo để xoay bản đồ, chạm đảo để chọn.',
    examName: 'Exam Mode', examVi: 'Đề tổng hợp có giờ', exam: '30 câu trộn từ 5 bài, 30 phút, không gợi ý. Màn này đang ở bản ôn.',
    review: 'Mở bài học, mindmap, flashcard', examOpen: 'Mở Exam Mode ở bản ôn',
    back: 'Về bản đồ', qn: (i: number, n: number) => `Câu ${i}/${n}`,
    right: 'ĐÚNG', wrong: 'SAI', src: 'Nguồn slide', next: 'Câu tiếp', finish: 'Xem kết quả',
    scored: (a: number, b: number) => `Đúng ${a}/${b} câu`,
    pass: 'Qua màn!', notYet: 'Chưa qua màn', needMore: (k: number) => `Thiếu ${k} câu đúng để hạ quái và qua màn.`, short: 'Lượt dưới 5 câu có XP nhưng không tính qua màn.',
    day: 'Ngày', night: 'Đêm', lang: 'Đổi ngôn ngữ',
    hp: 'Máu của quái', streak: 'Streak', nextMult: 'Đòn tới',
    shot: (d: number, s: number, name: string, hp: number) => `Trúng ${d} sát thương, streak ${s}, ${name} còn ${hp} máu.`,
    miss: 'Trượt, streak về 0.', defeated: (name: string) => `Đã hạ ${name}!`, survived: (name: string, hp: number) => `${name} còn ${hp} HP.`,
    bestStreak: (n: number) => `Streak dài nhất: ${n}`, earned: (n: number) => `Nhận ${n} XP`, again: 'Đấu lượt mới',
    flip: 'Chạm để lật thẻ', flipBack: 'Chạm để lật lại', rare: 'Rare',
  },
  en: {
    left: (n: number, all: number) => `${n}/${all} questions left`,
    start: (n: number) => `Fight ${n} questions`, roundDone: 'No questions left in this World',
    world: (n: number) => `World ${n}`, monster: 'Island monster', prevWorld: 'Previous World', nextWorld: 'Next World',
    drag: 'Drag to turn the map, tap an island to select it.',
    examName: 'Exam Mode', examVi: '', exam: '30 mixed questions from 5 lectures, 30 minutes, no hints. This one lives in the review page.',
    review: 'Open lessons, mindmaps, flashcards', examOpen: 'Open Exam Mode in the review page',
    back: 'Back to map', qn: (i: number, n: number) => `Question ${i}/${n}`,
    right: 'CORRECT', wrong: 'WRONG', src: 'Slide source', next: 'Next question', finish: 'See results',
    scored: (a: number, b: number) => `${a}/${b} correct`,
    pass: 'Level clear!', notYet: 'Not cleared yet', needMore: (k: number) => `${k} more right answers to beat the monster and pass.`, short: 'Runs under 5 questions earn XP but do not count as a pass.',
    day: 'Day', night: 'Night', lang: 'Switch language',
    hp: 'Monster health', streak: 'Streak', nextMult: 'Next hit',
    shot: (d: number, s: number, name: string, hp: number) => `Hit for ${d} damage, streak ${s}, ${name} has ${hp} health left.`,
    miss: 'Missed, streak back to 0.', defeated: (name: string) => `${name} defeated!`, survived: (name: string, hp: number) => `${name} has ${hp} HP left.`,
    bestStreak: (n: number) => `Longest streak: ${n}`, earned: (n: number) => `Earned ${n} XP`, again: 'Start a new run',
    flip: 'Tap to flip the card', flipBack: 'Tap to flip back', rare: 'Rare',
  },
};
export type Strings = typeof T.vi;
export const strings = (lang: Lang): Strings => T[lang];
