import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/8bit/button';
import { Card } from '@/components/ui/8bit/card';
import { isRight, pick, type Run } from '@/game/run';
import type { Lang } from '@/game/progress';
import { Rich } from '@/lib/Rich';
import type { Strings } from '@/i18n';

type Props = {
  run: Run; lang: Lang; t: Strings;
  onAnswer: (next: Run) => void; onNext: () => void; onQuit: () => void;
};

export function QuizScreen({ run, lang, t, onAnswer, onNext, onQuit }: Props) {
  const it = run.items[run.i], q = it.q, n = run.items.length;
  const answered = it.pick !== null;
  const nextRef = useRef<HTMLButtonElement>(null);
  const tabNav = useRef(false);

  useEffect(() => { if (answered) nextRef.current?.focus({ preventScroll: true }); }, [answered]);

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
  }, [answered, onNext]);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <Button font="normal" variant="secondary" onClick={onQuit}>◀ {t.back}</Button>
        <h1 className="hud-label">W{run.w} · QUIZ</h1>
      </div>
      <Card font="normal">
        <motion.div key={q.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .18 }} className="grid gap-4 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-gold">{t.qn(run.i + 1, n)}</span>
            <div className="flex gap-1" aria-hidden="true">
              {run.items.map((x, k) => (
                <i key={k} className={`block size-2.5 border border-border ${k === run.i ? 'bg-gold' : x.pick === null ? 'bg-secondary' : isRight(x) ? 'bg-good' : 'bg-bad'}`} />
              ))}
            </div>
          </div>
          <p lang="en" className="text-lg font-semibold leading-snug"><Rich text={q.q} /></p>
          <div className="grid gap-2" lang="en">
            {it.order.map((oi, k) => {
              const right = answered && oi === q.a, wrong = answered && oi === it.pick && oi !== q.a;
              return (
                <motion.button
                  key={oi} className={`opt ${right ? 'right' : ''} ${wrong ? 'wrong' : ''}`} disabled={answered}
                  animate={wrong ? { x: [0, -5, 5, -3, 3, 0] } : {}} transition={{ duration: .3 }}
                  onClick={() => onAnswer(pick(run, oi))}
                >
                  <span className="hud-label pt-1 text-gold">{'ABCD'[k]}</span>
                  <span className="flex-1"><Rich text={q.o[oi]} /></span>
                  {right && <span className="shrink-0 text-sm font-extrabold text-good">✔ {t.right}</span>}
                  {wrong && <span className="shrink-0 text-sm font-extrabold text-bad">✘ {t.wrong}</span>}
                </motion.button>
              );
            })}
          </div>
          <div aria-live="polite">
            {answered && (
              <div className="border-l-4 border-gold bg-secondary p-3 text-sm leading-relaxed">
                <Rich text={lang === 'en' ? q.en : q.vi} />
                <div className="mt-1 text-xs text-muted-foreground">{t.src}: {q.src}</div>
              </div>
            )}
          </div>
          {answered && (
            <div className="flex justify-end">
              <Button font="normal" ref={nextRef} onClick={onNext}>
                {run.i === n - 1 ? t.finish : t.next}
                <span aria-hidden="true" className="ml-2 hidden border border-current px-1 text-[11px] [@media(hover:hover)]:inline">Enter</span>
              </Button>
            </div>
          )}
        </motion.div>
      </Card>
    </div>
  );
}
