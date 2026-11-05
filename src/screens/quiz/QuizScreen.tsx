import { motion } from 'motion/react';
import { Button } from '@/components/ui/8bit/button';
import { battleOf, multiplierFor } from '@/game/battle';
import { MONSTERS, ROBOT } from '@/game/sprites';
import { Rich } from '@/lib/Rich';
import './quiz.css';
import { DamagePop, Explain, HpBar, Monster, NextButton, Options, PixelSprite, Pips, Shot, hitKeyOf, tierOf, type QuizProps } from './parts';

// Battle stage on top, command menu in a dialogue box below.
export function QuizScreen({ run, lang, t, onAnswer, onNext, onQuit }: Omit<QuizProps, 'battle'>) {
  const battle = battleOf(run), q = run.items[run.i].q, hitKey = hitKeyOf(run, battle);
  return (
    <div className="quiz arena grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <Button font="normal" variant="secondary" onClick={onQuit}>◀ {t.back}</Button>
        <h1 className="hud-label">World {run.w}</h1>
      </div>
      <section className="stage">
        <div className="plate">
          <div className="pixel-title plate-name">{MONSTERS[run.w].name}</div>
          <HpBar battle={battle} t={t} />
        </div>
        <div className="stage-monster">
          <Monster w={run.w} battle={battle} hitKey={hitKey} size={92} />
          {battle.hit > 0 && <DamagePop hitKey={hitKey} damage={battle.hit} tier={tierOf(battle)} />}
        </div>
        <div className="stage-robot">
          <motion.div key={battle.streak} animate={battle.hit ? { y: [0, -6, 0] } : {}} transition={{ duration: .2 }}>
            <PixelSprite sprite={ROBOT} size={60} />
          </motion.div>
          <div className="plate streak-plate">
            <div>{t.streak} {battle.streak}</div>
            <div className="text-gold">{t.nextMult} ×{multiplierFor(battle.streak + 1)}</div>
          </div>
        </div>
        {battle.hit > 0 && <Shot hitKey={hitKey} tier={tierOf(battle)} from={['22%', '66%']} to={['76%', '42%']} />}
      </section>
      <div className="dialog grid gap-3">
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
  );
}
