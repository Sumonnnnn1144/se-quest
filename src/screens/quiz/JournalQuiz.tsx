import { Button } from '@/components/ui/8bit/button';
import { MONSTERS } from '@/game/sprites';
import { Rich } from '@/lib/Rich';
import { DamagePop, Explain, HpBar, Monster, NextButton, Options, Pips, Shot, hitKeyOf, tierOf, type QuizProps } from './parts';

// A wooden notebook: reading comes first, the fight stays in a small window in the corner.
export function JournalQuiz({ run, battle, lang, t, onAnswer, onNext, onQuit }: QuizProps) {
  const q = run.items[run.i].q, hitKey = hitKeyOf(run, battle);
  return (
    <div className="quiz journal grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <Button font="normal" variant="secondary" onClick={onQuit}>◀ {t.back}</Button>
        <h1 className="hud-label">World {run.w}</h1>
      </div>
      <div className="wood">
        <div className="page grid gap-3">
          <div className="journal-head">
            <div className="grid min-w-0 flex-1 content-start gap-2">
              <span className="text-sm font-extrabold text-gold">{t.qn(run.i + 1, run.items.length)}</span>
              <Pips run={run} />
              <div className="text-sm font-semibold">{t.streak} {battle.streak}</div>
            </div>
            <section className="window">
              <div className="window-sky">
                <Monster w={run.w} battle={battle} hitKey={hitKey} size={60} />
                {battle.hit > 0 && <DamagePop hitKey={hitKey} damage={battle.hit} tier={tierOf(battle)} />}
                {battle.hit > 0 && <Shot hitKey={hitKey} tier={tierOf(battle)} from={['4%', '76%']} to={['52%', '46%']} />}
              </div>
              <div className="pixel-title plate-name">{MONSTERS[run.w].name}</div>
              <HpBar battle={battle} t={t} />
            </section>
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
