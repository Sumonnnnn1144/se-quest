import { useCallback, useEffect, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { Button } from '@/components/ui/8bit/button';
import { Card } from '@/components/ui/8bit/card';
import XpBar from '@/components/ui/8bit/xp-bar';
import { QUIZ, WORLDS } from '@/content';
import { load, recordAnswer, save, type Progress } from '@/game/progress';
import { RANKS, XP_CORRECT, batchSize, rankOf, rankProgress } from '@/game/rules';
import { isRight, startRun, type Run } from '@/game/run';
import { MONSTERS } from '@/game/sprites';
import { strings } from '@/i18n';
import { BattleResult } from '@/screens/quiz/BattleResult';
import { QuizScreen, VARIANTS, type Variant } from '@/screens/quiz';
import { PixelSprite } from '@/screens/quiz/parts';

const initialDark = () => {
  const host = document.documentElement.dataset.theme;
  if (host) return host === 'dark';
  try { const s = localStorage.getItem('sq-theme'); if (s) return s === 'dark'; } catch { /* no storage */ }
  return matchMedia('(prefers-color-scheme: dark)').matches;
};

// A link can open one version directly, e.g. #combo, so options are easy to compare.
const initialVariant = (): Variant => {
  const fromHash = location.hash.slice(1) as Variant;
  if (VARIANTS.includes(fromHash)) return fromHash;
  try { const s = localStorage.getItem('sq-variant') as Variant; if (VARIANTS.includes(s)) return s; } catch { /* no storage */ }
  return 'arena';
};

export default function App() {
  const [p, setP] = useState<Progress>(load);
  const [run, setRun] = useState<Run | null>(null);
  const [done, setDone] = useState(false);
  const [dark, setDark] = useState(initialDark);
  const [variant, setVariant] = useState(initialVariant);
  const t = strings(p.lang);

  useEffect(() => save(p), [p]);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.lang = p.lang;
  }, [dark, p.lang]);

  const toggleTheme = () => {
    try { localStorage.setItem('sq-theme', dark ? 'light' : 'dark'); } catch { /* no storage */ }
    setDark(!dark);
  };
  const pickVariant = (v: Variant) => {
    try { localStorage.setItem('sq-variant', v); } catch { /* no storage */ }
    setVariant(v);
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

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh bg-background">
        <header className="sticky top-0 z-10 border-b-4 border-border bg-background">
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-2">
            <span className="pixel-title text-2xl leading-none">SE QUEST</span>
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex justify-between text-xs font-semibold"><span>{RANKS[rankOf(p.xp)][0]}</span><span>{p.xp} XP</span></div>
              <XpBar value={rankProgress(p.xp)} aria-label="XP" className="h-3" />
            </div>
            <Button font="normal" variant="secondary" size="sm" onClick={() => setP(c => ({ ...c, lang: c.lang === 'vi' ? 'en' : 'vi' }))}>{p.lang === 'vi' ? 'EN' : 'VI'}</Button>
            <Button font="normal" variant="secondary" size="sm" onClick={toggleTheme}>{dark ? t.day : t.night}</Button>
          </div>
        </header>
        <main className="mx-auto grid max-w-3xl gap-4 px-4 py-5">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t.variantLabel}>
            {VARIANTS.map((v, k) => (
              <button key={v} data-variant={v} aria-pressed={v === variant} onClick={() => pickVariant(v)} className={`border-2 border-border px-3 py-1 text-sm font-semibold ${v === variant ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                {k + 1}. {t.variants[v]}
              </button>
            ))}
          </div>
          {!run && (
            <>
              <h1 className="pixel-title text-4xl leading-none">{t.tagline}</h1>
              {WORLDS.map(w => {
                const all = QUIZ.filter(q => q.w === w.w).length;
                const left = all - (p.seen[w.w]?.length ?? 0);
                return (
                  <Card font="normal" key={w.w}>
                    <div className="flex flex-wrap items-center gap-3 p-4">
                      <PixelSprite sprite={MONSTERS[w.w]} size={56} />
                      <div className="min-w-0 flex-1">
                        <h2 className="pixel-title text-2xl leading-none text-gold">W{w.w}: {w.name}</h2>
                        <p className="text-sm">{p.lang === 'vi' ? w.vi : MONSTERS[w.w].name}</p>
                        <p className="text-sm">{t.left(left, all)}</p>
                      </div>
                      {left
                        ? <Button font="normal" onClick={() => setRun(startRun(w.w, QUIZ, p.seen[w.w] ?? []))}>{t.start(batchSize(left))}</Button>
                        : <span className="text-sm font-semibold">{t.roundDone}</span>}
                    </div>
                  </Card>
                );
              })}
            </>
          )}
          {run && !done && <QuizScreen variant={variant} run={run} lang={p.lang} t={t} onAnswer={onAnswer} onNext={onNext} onQuit={quit} />}
          {run && done && <BattleResult run={run} t={t} variant={variant} onBack={quit} />}
        </main>
      </div>
    </MotionConfig>
  );
}
