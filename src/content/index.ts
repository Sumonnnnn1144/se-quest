import quiz from '../../content/midterm/quiz.json';
import flashcards from '../../content/midterm/flashcards.json';
import type { Question } from '@/game/run';

export const QUIZ = quiz as Question[];

export type World = { w: number; name: string; vi: string; color: string };
export const WORLDS: World[] = [
  { w: 1, name: 'SE Introduction', vi: 'Nhập môn Công nghệ phần mềm', color: '#e0913a' },
  { w: 2, name: 'Software Processes', vi: 'Quy trình phần mềm', color: '#5cc24a' },
  { w: 3, name: 'Project Management', vi: 'Quản lý dự án', color: '#e8485f' },
  { w: 4, name: 'Requirements Engineering', vi: 'Kỹ nghệ yêu cầu', color: '#8a8bf5' },
  { w: 5, name: 'Use Case & UI/UX', vi: 'Use case & thiết kế UI/UX', color: '#c04fe0' },
];
// The sixth island on the map.
export const EXAM_ISLAND = 6;
export const EXAM_COLOR = '#7a7490';

export type RewardCard = { w: number; f: string; vi: string; en: string; src: string };
const REWARD_MATCH: Record<number, RegExp> = { 1: /ethic/i, 2: /waterfall/i, 3: /critical/i, 4: /moscow/i, 5: /include|extend/i };

// The flashcard a World awards when its monster falls.
export function rewardCard(w: number): RewardCard {
  const cards = (flashcards as RewardCard[]).filter(c => c.w === w);
  return cards.find(c => REWARD_MATCH[w].test(c.f)) ?? cards[0];
}
