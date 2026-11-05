import { battleOf } from '@/game/battle';
import { ArenaQuiz } from './ArenaQuiz';
import { ComboQuiz } from './ComboQuiz';
import { JournalQuiz } from './JournalQuiz';
import type { QuizProps } from './parts';
import './quiz.css';

export const VARIANTS = ['arena', 'combo', 'journal'] as const;
export type Variant = (typeof VARIANTS)[number];

const SCREENS = { arena: ArenaQuiz, combo: ComboQuiz, journal: JournalQuiz };

export function QuizScreen({ variant, ...props }: Omit<QuizProps, 'battle'> & { variant: Variant }) {
  const Screen = SCREENS[variant];
  return <Screen {...props} battle={battleOf(props.run)} />;
}
