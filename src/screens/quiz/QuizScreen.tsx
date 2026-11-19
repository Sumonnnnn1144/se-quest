import { useEffect, useRef, useState } from 'react';
import { battleOf, multiplierFor, tierFor } from '@/game/battle';
import { isRight } from '@/game/run';
import { MONSTERS } from '@/game/sprites';
import type { GameScene, RectSource } from '@/scene/engine';
import { Rich } from '@/lib/Rich';
import { Explain, NextButton, Options, Pips, multLabel, type QuizProps } from './parts';

type Pop = { key: string; x: number; y: number; damage: number; tier: number };

// The scene fills the screen on desktop with the question beside it, and sits above the question on a phone.
export function QuizScreen({ scene, run, lang, t, onAnswer, onNext, onQuit }: Omit<QuizProps, 'battle'> & { scene: GameScene | null }) {
  const it = run.items[run.i], q = it.q, battle = battleOf(run), before = battleOf({ ...run, i: run.i - 1 });
  const [landed, setLanded] = useState<string | null>(null);
  const [pop, setPop] = useState<Pop | null>(null);
  const handled = useRef<string | null>(null);
  const dialog = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!scene) return;
    const rect: RectSource = (W, H) => {
      const box = dialog.current?.getBoundingClientRect();
      if (W >= 900 && box) return { x: 0, y: 92, w: W - box.width - 26, h: H - 92 };
      return { x: 0, y: 88, w: W, h: H - 88 };
    };
    scene.showBattle(run.w, rect);
    // One scene per run: the parent remounts this screen for a new run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  // Health drops when the shot lands, not when the answer is clicked.
  const answered = it.pick !== null, right = answered && isRight(it), shoots = right && !before.down;
  useEffect(() => {
    if (!answered || handled.current === q.id) return;
    handled.current = q.id;
    if (!right) { if (!before.down) scene?.miss(); return; }
    if (!shoots) return;
    const tier = tierFor(battle.hitStreak);
    const land = () => {
      setLanded(q.id);
      const at = scene?.monsterPx();
      if (at) setPop({ key: q.id, damage: battle.hit, tier, ...at });
      if (battle.down) scene?.shatter();
    };
    if (scene) scene.fire(tier).then(land); else land();
    // Runs once per answered question, guarded by handled.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answered, q.id]);

  const hp = shoots && landed !== q.id ? before.hp : battle.hp;
  return (
    <>
      <h1 className="sr-only">{t.world(run.w)}: {MONSTERS[run.w].name}</h1>
      <div className="plates">
        <div className="plate">
          <div className="streak-n">{t.streak} {battle.streak}</div>
          <div className="streak-m">{t.nextMult} ×{multLabel(multiplierFor(battle.streak + 1), lang)}</div>
        </div>
        <div className="plate mon">
          <div className="plate-name">{MONSTERS[run.w].name}</div>
          <div className="hp" role="img" aria-label={`${t.hp}: ${hp}/${battle.maxHp}`}><i style={{ width: `${hp / battle.maxHp * 100}%` }} /></div>
          <div className="hp-num">HP {hp}/{battle.maxHp}</div>
        </div>
      </div>
      {pop && <span key={pop.key} className={`dmg t${pop.tier}`} aria-hidden="true" style={{ left: pop.x, top: pop.y }}>−{pop.damage}</span>}
      <section className="dialog" ref={dialog}>
        <div className="q-box">
          <div className="q-top">
            <button className="btn small" onClick={onQuit}>◀ {t.back}</button>
            <span className="q-count">{t.qn(run.i + 1, run.items.length)}</span>
            <Pips run={run} />
          </div>
          <p lang="en" className="q-text"><Rich text={q.q} /></p>
          <Options run={run} t={t} onAnswer={onAnswer} />
          <Explain run={run} battle={battle} lang={lang} t={t} />
          <NextButton run={run} t={t} onNext={onNext} />
        </div>
      </section>
    </>
  );
}
