import { useEffect, useRef, type RefObject } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Button } from '@/components/ui/8bit/button';
import HealthBar from '@/components/ui/8bit/health-bar';
import { tierFor, type Battle } from '@/game/battle';
import type { Lang } from '@/game/progress';
import { isRight, pick, type Run } from '@/game/run';
import { MONSTERS, type Sprite } from '@/game/sprites';
import type { Strings } from '@/i18n';
import { Rich } from '@/lib/Rich';

export type QuizProps = {
  run: Run; battle: Battle; lang: Lang; t: Strings;
  onAnswer: (next: Run) => void; onNext: () => void; onQuit: () => void;
};

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

// Reacts when a shot lands, just after the bullet arrives.
export function Monster({ w, battle, hitKey, size }: { w: number; battle: Battle; hitKey: string; size: number }) {
  return (
    <motion.div
      key={hitKey}
      className={`monster ${battle.down ? 'is-down' : ''}`}
      animate={battle.hit ? { x: [0, 7, -5, 3, 0], filter: ['brightness(1)', 'brightness(2.2)', 'brightness(1)'] } : {}}
      transition={{ duration: .3, delay: .24 }}
    >
      <PixelSprite sprite={MONSTERS[w]} size={size} />
    </motion.div>
  );
}

export function Shot({ hitKey, tier, from, to }: { hitKey: string; tier: number; from: [string, string]; to: [string, string] }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <motion.i
      key={hitKey}
      className={`shot t${tier}`}
      aria-hidden="true"
      initial={{ left: from[0], top: from[1], opacity: 1 }}
      animate={{ left: to[0], top: to[1], opacity: [1, 1, 0] }}
      transition={{ duration: .28, ease: 'easeIn' }}
    />
  );
}

export function DamagePop({ hitKey, damage, tier }: { hitKey: string; damage: number; tier: number }) {
  return (
    <motion.span
      key={hitKey}
      className={`dmg t${tier}`}
      aria-hidden="true"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: [0, 1, 1, 0], y: [6, -16, -22, -30] }}
      transition={{ duration: .9, delay: .24, times: [0, .15, .75, 1] }}
    >
      -{damage}
    </motion.span>
  );
}

export function HpBar({ battle, t }: { battle: Battle; t: Strings }) {
  return (
    <div className="hpbar">
      <HealthBar value={battle.hp / battle.maxHp * 100} variant="retro" aria-label={t.hp} className="h-3" />
      <span className="hpnum">HP {battle.hp}/{battle.maxHp}</span>
    </div>
  );
}

export function Pips({ run }: { run: Run }) {
  return (
    <div className="flex flex-wrap gap-1" aria-hidden="true">
      {run.items.map((x, k) => (
        <i key={k} className={`block size-2.5 border border-border ${k === run.i ? 'bg-gold' : x.pick === null ? 'bg-secondary' : isRight(x) ? 'bg-good' : 'bg-bad'}`} />
      ))}
    </div>
  );
}

export function Options({ run, t, onAnswer }: Pick<QuizProps, 'run' | 't' | 'onAnswer'>) {
  const it = run.items[run.i], q = it.q, answered = it.pick !== null;
  return (
    <div className="opts" lang="en">
      {it.order.map((oi, k) => {
        const right = answered && oi === q.a, wrong = answered && oi === it.pick && oi !== q.a;
        return (
          <motion.button
            key={oi} className={`opt ${right ? 'right' : ''} ${wrong ? 'wrong' : ''}`} disabled={answered}
            animate={wrong ? { x: [0, -5, 5, -3, 3, 0] } : {}} transition={{ duration: .3 }}
            onClick={() => onAnswer(pick(run, oi))}
          >
            <span className="opt-key">{'ABCD'[k]}</span>
            <span className="min-w-0 flex-1"><Rich text={q.o[oi]} /></span>
            {right && <span className="opt-mark text-good">✔ {t.right}</span>}
            {wrong && <span className="opt-mark text-bad">✘ {t.wrong}</span>}
          </motion.button>
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
            <Rich text={lang === 'en' ? it.q.en : it.q.vi} />
            <div className="explain-src">{t.src}: {it.q.src}</div>
          </div>
        </>
      )}
    </div>
  );
}

function useEnterToNext(answered: boolean, onNext: () => void, nextRef: RefObject<HTMLButtonElement | null>) {
  const tabNav = useRef(false);
  useEffect(() => { if (answered) nextRef.current?.focus({ preventScroll: true }); }, [answered, nextRef]);

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
    <div className="flex justify-end">
      <Button font="normal" ref={nextRef} onClick={onNext}>
        {run.i === run.items.length - 1 ? t.finish : t.next}
        <span aria-hidden="true" className="ml-2 hidden border border-current px-1 text-[11px] [@media(hover:hover)]:inline">Enter</span>
      </Button>
    </div>
  );
}

export const hitKeyOf = (run: Run, battle: Battle) => (battle.hit ? `${run.items[run.i].q.id}-hit` : 'idle');
export const tierOf = (battle: Battle) => tierFor(battle.hitStreak);
