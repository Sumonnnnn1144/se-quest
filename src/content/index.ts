import quiz from '../../content/midterm/quiz.json';
import type { Question } from '@/game/run';

export const QUIZ = quiz as Question[];

export const WORLDS = [
  { w: 1, name: 'SE Introduction', vi: 'Nhập môn Công nghệ phần mềm' },
  { w: 2, name: 'Software Processes', vi: 'Quy trình phần mềm' },
  { w: 3, name: 'Project Management', vi: 'Quản lý dự án' },
  { w: 4, name: 'Requirements Engineering', vi: 'Kỹ nghệ yêu cầu' },
  { w: 5, name: 'Use Case & UI/UX', vi: 'Use case & thiết kế UI/UX' },
];
