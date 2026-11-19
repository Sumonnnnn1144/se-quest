import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { rewardCard } from '@/content';
import { battleOf } from '@/game/battle';
import type { Lang } from '@/game/progress';
import { MIN_RUN, XP_CORRECT } from '@/game/rules';
import { passed, score, type Run } from '@/game/run';
import { MONSTERS } from '@/game/sprites';
import type { Strings } from '@/i18n';
import { Rich } from '@/lib/Rich';
import type { GameScene } from '@/scene/engine';
import { PixelSprite } from './parts';

type Props = { scene: GameScene | null; run: Run; lang: Lang; t: Strings; canPlayAgain: boolean; onBack: () => void; onAgain: () => void };

export function BattleResult({ scene, run, lang, t, canPlayAgain, onBack, onAgain }: Props) {
  const battle = battleOf({ ...run, i: run.items.length - 1 }), n = run.items.length, name = MONSTERS[run.w].name, won = passed(run);
  const [flipped, setFlipped] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const back = useRef<HTMLButtonElement>(null);
  const card = rewardCard(run.w);

  useEffect(() => {
    back.current?.focus({ preventScroll: true });
    scene?.setOver();
    if (won) scene?.confetti();
    // Once, when the result appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  const onTilt = (e: PointerEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({ x: -((e.clientY - r.top) / r.height - .5) * 18, y: ((e.clientX - r.left) / r.width - .5) * 22 });
  };
  const tiltVars = { '--rx': `${tilt.x}deg`, '--ry': `${tilt.y}deg` } as CSSProperties;

  return (
    <section className="result" role="status">
      <div className={`r-box ${won ? '' : 'nocard'}`}>
        {won && (
          <button className="card" aria-pressed={flipped} style={tiltVars} onClick={() => setFlipped(!flipped)} onPointerMove={onTilt} onPointerLeave={() => setTilt({ x: 0, y: 0 })}>
            <span className="card-in">
              <span className="face front">
                <span className="rar"><span>{t.world(run.w)}</span><span>{t.rare}</span></span>
                <span className="art"><PixelSprite sprite={MONSTERS[run.w]} size={112} /></span>
                <span className="c-title">{card.f}</span>
                <span className="flip">{t.flip}</span>
              </span>
              <span className="face back">
                <span><Rich text={lang === 'en' ? card.en : card.vi} /></span>
                <span className="c-src">{t.src}: {card.src}</span>
                <span className="flip">{t.flipBack}</span>
              </span>
            </span>
          </button>
        )}
        <div className="r-text">
          <h1 className="d-title">{won ? t.pass : t.notYet}</h1>
          <p className="r-score">{t.scored(score(run), n)}</p>
          <p className="sub">{battle.down ? t.defeated(name) : t.survived(name, battle.hp)}</p>
          {n < MIN_RUN && <p className="sub">{t.short}</p>}
          {n >= MIN_RUN && !won && <p className="sub">{t.needMore(battle.need - battle.right)}</p>}
          <p className="sub">{t.bestStreak(battle.best)}</p>
          <p className="sub">{t.earned(score(run) * XP_CORRECT)}</p>
          <div className="r-acts">
            <button className="btn main" ref={back} onClick={onBack}>{t.back}</button>
            {canPlayAgain && <button className="btn" onClick={onAgain}>{t.again}</button>}
          </div>
        </div>
      </div>
    </section>
  );
}
