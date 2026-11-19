import { useCallback, useEffect, useRef, useState } from 'react';
import { QUIZ, WORLDS } from '@/content';
import { load, recordAnswer, save, type Progress } from '@/game/progress';
import { RANKS, XP_CORRECT, rankOf, rankProgress } from '@/game/rules';
import { isRight, startRun, type Run } from '@/game/run';
import { MONSTERS, ROBOT } from '@/game/sprites';
import { strings } from '@/i18n';
import type { GameScene } from '@/scene/engine';
import { MapScreen } from '@/screens/MapScreen';
import { BattleResult } from '@/screens/quiz/BattleResult';
import { QuizScreen } from '@/screens/quiz/QuizScreen';
import '@/screens/game.css';

const initialDark = () => {
  try { const s = localStorage.getItem('sq-theme'); if (s) return s === 'dark'; } catch { /* no storage */ }
  return matchMedia('(prefers-color-scheme: dark)').matches;
};
const firstOpenWorld = (p: Progress) => WORLDS.find(w => QUIZ.filter(q => q.w === w.w).length > (p.seen[w.w]?.length ?? 0))?.w ?? 1;
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function App() {
  const [p, setP] = useState<Progress>(load);
  const [run, setRun] = useState<Run | null>(null);
  const [runId, setRunId] = useState(0);
  const [done, setDone] = useState(false);
  const [dark, setDark] = useState(initialDark);
  const [sel, setSel] = useState(() => firstOpenWorld(load()));
  const [scene, setScene] = useState<GameScene | null>(null);
  const [noScene, setNoScene] = useState(false);
  const [wiping, setWiping] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const t = strings(p.lang);
  const world = run?.w ?? sel;

  useEffect(() => save(p), [p]);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', dark);
    root.lang = p.lang;
    root.dataset.w = String(world);
  }, [dark, p.lang, world]);

  // Three.js loads as its own chunk. Without WebGL the game still works, only the scene is missing.
  useEffect(() => {
    let gone = false, made: GameScene | null = null;
    import('@/scene/engine').then(({ createScene }) => {
      if (gone) return;
      try {
        made = createScene(canvasRef.current!, stageRef.current!, {
          monsters: MONSTERS, robot: ROBOT, reduce: reduceMotion(), onPick: setSel,
          colors: Object.fromEntries(WORLDS.map(w => [w.w, w.color])),
        });
        setScene(made);
      } catch { setNoScene(true); }
    }).catch(() => setNoScene(true));
    return () => { gone = true; made?.dispose(); setScene(null); };
  }, []);
  useEffect(() => { scene?.setTheme(dark); }, [scene, dark]);

  const toggleTheme = () => {
    try { localStorage.setItem('sq-theme', dark ? 'light' : 'dark'); } catch { /* no storage */ }
    setDark(!dark);
  };
  const onAnswer = (next: Run) => {
    const it = next.items[next.i];
    setP(cur => recordAnswer(cur, next.w, it.q.id, isRight(it), XP_CORRECT));
    setRun(next);
  };
  const onNext = useCallback(() => {
    if (!run) return;
    if (run.i === run.items.length - 1) setDone(true);
    else setRun({ ...run, i: run.i + 1 });
  }, [run]);
  const quit = () => { setRun(null); setDone(false); };

  const startBattle = async (w: number) => {
    const go = () => { setRun(startRun(w, QUIZ, p.seen[w] ?? [])); setRunId(id => id + 1); setDone(false); };
    if (!scene || reduceMotion() || run) { go(); return; }
    await scene.dive(w);
    setWiping(true);
    setTimeout(() => { go(); setTimeout(() => setWiping(false), 120); }, 200);
  };

  const rank = rankOf(p.xp), nextXp = RANKS[rank + 1]?.[1];
  const leftInRun = run ? QUIZ.filter(q => q.w === run.w).length - (p.seen[run.w]?.length ?? 0) : 0;

  return (
    <div id="app" data-screen={run ? 'battle' : 'map'} data-over={done ? '' : undefined}>
      <div id="stage" ref={stageRef}>
        <div className="stars" />
        <canvas ref={canvasRef} className="gl" aria-hidden="true" />
      </div>
      <header className="hud">
        <span className="logo">SE QUEST</span>
        <div className="rank">
          <div className="rank-row"><span>{RANKS[rank][0]}</span><span>{nextXp ? `${p.xp}/${nextXp}` : p.xp}<span className="xp-word"> XP</span></span></div>
          <div className="xp" role="progressbar" aria-label="XP" aria-valuemin={0} aria-valuemax={100} aria-valuenow={rankProgress(p.xp)}>
            <i style={{ width: `${rankProgress(p.xp)}%` }} />
          </div>
        </div>
        <button className="btn" title={t.lang} onClick={() => setP(c => ({ ...c, lang: c.lang === 'vi' ? 'en' : 'vi' }))}>{p.lang === 'vi' ? 'EN' : 'VI'}</button>
        <button className="btn" onClick={toggleTheme}>{dark ? t.day : t.night}</button>
      </header>
      <main>
        {!run && <MapScreen scene={scene} noScene={noScene} sel={sel} setSel={setSel} progress={p} t={t} lang={p.lang} onStart={startBattle} />}
        {run && !done && <QuizScreen key={runId} scene={scene} run={run} lang={p.lang} t={t} onAnswer={onAnswer} onNext={onNext} onQuit={quit} />}
        {run && done && <BattleResult scene={scene} run={run} lang={p.lang} t={t} canPlayAgain={leftInRun > 0} onBack={quit} onAgain={() => startBattle(run.w)} />}
      </main>
      <div className={`wipe ${wiping ? 'on' : ''}`} />
    </div>
  );
}
