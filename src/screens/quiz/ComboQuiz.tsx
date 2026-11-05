import { motion } from 'motion/react';
import { Button } from '@/components/ui/8bit/button';
import { BASE_DAMAGE, multiplierFor } from '@/game/battle';
import { MONSTERS } from '@/game/sprites';
import { Rich } from '@/lib/Rich';
import { Explain, HpBar, Monster, NextButton, Options, Pips, Shot, hitKeyOf, tierOf, type QuizProps } from './parts';

// The damage formula is the star: base x streak multiplier, recounted on every right answer.
export function ComboQuiz({ run, battle, lang, t, onAnswer, onNext, onQuit }: QuizProps) {
  const q = run.items[run.i].q, hitKey = hitKeyOf(run, battle), answered = run.items[run.i].pick !== null;
  // Before answering, show what the next right answer is worth.
  const streak = answered && battle.hit ? battle.hitStreak : battle.streak + 1;
  const mult = multiplierFor(streak), total = BASE_DAMAGE * mult, tier = tierOf({ ...battle, hitStreak: streak });
  return (
    <div className="quiz combo grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <Button font="normal" variant="secondary" onClick={onQuit}>◀ {t.back}</Button>
        <h1 className="hud-label">World {run.w}</h1>
      </div>
      <div className="table-top">
        <section className="combo-rail">
          <div className="combo-monster">
            <Monster w={run.w} battle={battle} hitKey={hitKey} size={84} />
            <div className="min-w-0 flex-1">
              <div className="pixel-title plate-name">{MONSTERS[run.w].name}</div>
              <HpBar battle={battle} t={t} />
            </div>
          </div>
          <div className="formula" aria-hidden="true">
            <b className="chip">{BASE_DAMAGE}</b>
            <span>×</span>
            <b className="mult">{mult}</b>
            <span>=</span>
            <motion.strong
              key={`${hitKey}-${total}`} className={`total t${tier}`}
              animate={battle.hit ? { scale: [1, 1.7, 1], rotate: [0, -6, 0] } : {}} transition={{ duration: .35, delay: .2 }}
            >
              {total}
            </motion.strong>
          </div>
          <div className="combo-note">
            {answered && !battle.hit ? t.miss : answered ? t.streakNow(battle.streak) : t.nextShot(total)}
          </div>
          {battle.hit > 0 && <Shot hitKey={hitKey} tier={tierOf(battle)} from={['70%', '74%']} to={['14%', '22%']} />}
        </section>
        <div className="grid min-w-0 content-start gap-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-gold">{t.qn(run.i + 1, run.items.length)}</span>
            <Pips run={run} />
          </div>
          <p lang="en" className="q-text"><Rich text={q.q} /></p>
          <Options run={run} t={t} onAnswer={onAnswer} />
          <Explain run={run} battle={battle} lang={lang} t={t} />
          <NextButton run={run} t={t} onNext={onNext} />
        </div>
      </div>
    </div>
  );
}
