import { useEffect, useRef } from 'react';
import { EXAM_COLOR, EXAM_ISLAND, QUIZ, WORLDS } from '@/content';
import type { Lang, Progress } from '@/game/progress';
import { batchSize } from '@/game/rules';
import { MONSTERS } from '@/game/sprites';
import type { Strings } from '@/i18n';
import type { GameScene, RectSource } from '@/scene/engine';

// The midterm review page ships with the site until its screens move to React.
const REVIEW_PAGE = '/se-quest-on-giua-ky.html';

type Props = {
  scene: GameScene | null; noScene: boolean; sel: number; setSel: (w: number) => void;
  progress: Progress; t: Strings; lang: Lang; onStart: (w: number) => void;
};

export function MapScreen({ scene, noScene, sel, setSel, progress, t, lang, onStart }: Props) {
  const sheet = useRef<HTMLElement>(null);
  const worldOf = WORLDS.find(w => w.w === sel);
  const all = QUIZ.filter(q => q.w === sel).length;
  const left = all - (progress.seen[sel]?.length ?? 0);

  useEffect(() => {
    if (!scene) return;
    // Beside the sheet on desktop, above it on a phone.
    const rect: RectSource = (W, H) => {
      const box = sheet.current?.getBoundingClientRect();
      if (!box) return { x: 0, y: 0, w: W, h: H };
      return W >= 900 ? { x: box.right - 6, y: 54, w: W - box.right, h: H - 70 } : { x: 0, y: 50, w: W, h: Math.max(180, H - box.height - 44) };
    };
    scene.showMap(sel, rect);
    // Only on arrival; later selections go through select().
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);
  useEffect(() => { scene?.select(sel); scene?.reframe(); }, [scene, sel]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'ArrowLeft' && sel > 1) setSel(sel - 1);
      if (e.key === 'ArrowRight' && sel < EXAM_ISLAND) setSel(sel + 1);
      if (e.key === 'Enter' && document.activeElement === document.body && worldOf && left > 0) onStart(sel);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [sel, setSel, worldOf, left, onStart]);

  const islands = [...WORLDS.map(w => ({ id: w.w, short: `W${w.w}`, name: w.name, color: w.color })), { id: EXAM_ISLAND, short: 'Exam', name: '', color: EXAM_COLOR }];
  return (
    <>
      <nav className={`labels ${noScene ? 'flat' : ''}`} aria-label="Worlds">
        {islands.map(i => (
          <button
            key={i.id} className="lab" aria-current={sel === i.id} onClick={() => setSel(i.id)}
            ref={el => { scene?.setLabel(i.id, el); }}
          >
            <i style={{ background: i.color }} />{i.short}<span className="nm">{i.name}</span>
          </button>
        ))}
      </nav>
      <section className="sheet" ref={sheet} aria-live="polite">
        {worldOf ? (
          <>
            <p className="kicker">{t.world(sel)}</p>
            <h1 className="d-title">{worldOf.name}</h1>
            {lang === 'vi' && <p className="sub">{worldOf.vi}</p>}
            <ul className="facts">
              <li>{t.monster}: <b>{MONSTERS[sel].name}</b></li>
              <li>{t.left(left, all)}</li>
            </ul>
          </>
        ) : (
          <>
            <h1 className="d-title">{t.examName}</h1>
            {t.examVi && <p className="sub">{t.examVi}</p>}
            <p className="facts">{t.exam}</p>
          </>
        )}
        <div className="sheet-acts">
          <button className="btn" aria-label={t.prevWorld} disabled={sel === 1} onClick={() => setSel(sel - 1)}>◀</button>
          {worldOf && left > 0 && <button className="btn main" onClick={() => onStart(sel)}>{t.start(batchSize(left))} <kbd>Enter</kbd></button>}
          {worldOf && left === 0 && <p className="round-done">{t.roundDone}</p>}
          {!worldOf && <a className="btn main" href={REVIEW_PAGE}>{t.examOpen}</a>}
          <button className="btn" aria-label={t.nextWorld} disabled={sel === EXAM_ISLAND} onClick={() => setSel(sel + 1)}>▶</button>
        </div>
        {worldOf && <a className="review-link" href={REVIEW_PAGE}>{t.review}</a>}
        <p className="hint">{t.drag}</p>
      </section>
    </>
  );
}
