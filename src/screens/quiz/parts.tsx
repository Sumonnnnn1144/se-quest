import { useEffect, useRef, type RefObject } from 'react';
import type { Battle } from '@/game/battle';
import type { Lang } from '@/game/progress';
import { isRight, pick, type Run } from '@/game/run';
import { MONSTERS, type Sprite } from '@/game/sprites';
import type { Strings } from '@/i18n';
import { Rich } from '@/lib/Rich';

export type QuizProps = {
  run: Run; battle: Battle; lang: Lang; t: Strings;
  onAnswer: (next: Run) => void; onNext: () => void; onQuit: () => void;
};

export const multLabel = (m: number, lang: Lang) => (lang === 'vi' ? String(m).replace('.', ',') : String(m));

export function PixelSprite({ sprite, size, className }: { sprite: Sprite; size: number; className?: string }) {
  const w = sprite.rows[0].length, h = sprite.rows.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={size} height={size * h / w} shapeRendering="crispEdges" aria-hidden="true" className={className}>
      {sprite.rows.flatMap((row, y) => [...row].map((c, x) => (
        sprite.palette[c] ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={sprite.palette[c]} /> : null
      )))}
    </svg>
  );
}

export function Pips({ run }: { run: Run }) {
  return (
    <div className="pips" aria-hidden="true">
      {run.items.map((x, k) => (
        <i key={k} className={x.pick !== null ? (isRight(x) ? 'r' : 'x') : k === run.i ? 'now' : ''} />
      ))}
    </div>
  );
}

export function Options({ run, t, onAnswer }: Pick<QuizProps, 'run' | 't' | 'onAnswer'>) {
  const it = run.items[run.i], q = it.q, answered = it.pick !== null;

  // A-D or 1-4 answer from the keyboard.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (answered || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = ({ a: 0, b: 1, c: 2, d: 3, 1: 0, 2: 1, 3: 2, 4: 3 } as Record<string, number>)[e.key.toLowerCase()];
      if (k !== undefined && it.order[k] !== undefined) onAnswer(pick(run, it.order[k]));
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [answered, it.order, onAnswer, run]);

  return (
    <div className="opts" lang="en">
      {it.order.map((oi, k) => {
        const right = answered && oi === q.a, wrong = answered && oi === it.pick && oi !== q.a;
        return (
          <button key={oi} className={`opt ${right ? 'right' : wrong ? 'wrong' : answered ? 'dim' : ''}`} disabled={answered} onClick={() => onAnswer(pick(run, oi))}>
            <span className="cap" aria-hidden="true">{'ABCD'[k]}</span>
            <span className="otext"><Rich text={q.o[oi]} /></span>
            {right && <span className="mark good">✔ {t.right}</span>}
            {wrong && <span className="mark bad">✘ {t.wrong}</span>}
          </button>
        );
      })}
    </div>
  );
}

// The explanation, plus a spoken summary of the shot for screen readers.
export function Explain({ run, battle, lang, t }: Pick<QuizProps, 'run' | 'battle' | 'lang' | 't'>) {
  const it = run.items[run.i];
  const name = MONSTERS[run.w].name;
  return (
    <div aria-live="polite">
      {it.pick !== null && (
        <>
          <span className="sr-only">{battle.hit ? t.shot(battle.hit, battle.hitStreak, name, battle.hp) : t.miss}</span>
          <div className="explain">
            <p><Rich text={lang === 'en' ? it.q.en : it.q.vi} /></p>
            <p className="src">{t.src}: {it.q.src}</p>
          </div>
        </>
      )}
    </div>
  );
}

function useEnterToNext(answered: boolean, onNext: () => void, nextRef: RefObject<HTMLButtonElement | null>) {
  const tabNav = useRef(false);
  useEffect(() => {
    if (!answered) return;
    nextRef.current?.focus({ preventScroll: true });
    nextRef.current?.scrollIntoView({ block: 'nearest' });
  }, [answered, nextRef]);

  // Enter moves on from anywhere once answered. A control reached with Tab keeps its own Enter; a held key does not skip questions.
  useEffect(() => {
    const onPointer = () => { tabNav.current = false; };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') { tabNav.current = true; return; }
      if (e.key !== 'Enter' || e.repeat || !answered) return;
      const el = (e.target as Element).closest?.('button, a, input, textarea, select, [tabindex]');
      if (el === nextRef.current || (el && tabNav.current)) return;
      e.preventDefault();
      onNext();
    };
    document.addEventListener('pointerdown', onPointer, true);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [answered, onNext, nextRef]);
}

export function NextButton({ run, t, onNext }: Pick<QuizProps, 'run' | 't' | 'onNext'>) {
  const answered = run.items[run.i].pick !== null;
  const nextRef = useRef<HTMLButtonElement>(null);
  useEnterToNext(answered, onNext, nextRef);
  if (!answered) return null;
  return (
    <div className="q-next">
      <button className="btn main" ref={nextRef} onClick={onNext}>
        {run.i === run.items.length - 1 ? t.finish : t.next} <kbd aria-hidden="true">Enter</kbd>
      </button>
    </div>
  );
}
