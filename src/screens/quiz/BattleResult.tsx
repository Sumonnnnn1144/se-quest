import { motion } from 'motion/react';
import { Button } from '@/components/ui/8bit/button';
import { battleOf } from '@/game/battle';
import { MIN_RUN } from '@/game/rules';
import { passed, score, type Run } from '@/game/run';
import { MONSTERS } from '@/game/sprites';
import type { Strings } from '@/i18n';
import { Monster } from './parts';
import type { Variant } from './index';

export function BattleResult({ run, t, variant, onBack }: { run: Run; t: Strings; variant: Variant; onBack: () => void }) {
  const battle = battleOf({ ...run, i: run.items.length - 1 }), n = run.items.length, name = MONSTERS[run.w].name;
  return (
    <div className={`quiz ${variant}`}>
      <div className="result" role="status">
        <motion.h1
          className="pixel-title result-title"
          initial={{ scale: .7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 320, damping: 14 }}
        >
          {battle.down ? t.defeated(name) : t.survived(name, battle.hp)}
        </motion.h1>
        <div className="flex justify-center"><Monster w={run.w} battle={{ ...battle, hit: 0 }} hitKey="end" size={112} /></div>
        <p className="text-lg font-semibold">{t.scored(score(run), n)}</p>
        <p className="text-sm">{t.bestStreak(battle.best)}</p>
        {n < MIN_RUN && <p className="text-sm">{t.short}</p>}
        {n >= MIN_RUN && <p className="text-sm font-semibold">{passed(run) ? t.pass : t.needMore(battle.need - battle.right)}</p>}
        <div className="flex justify-center"><Button font="normal" onClick={onBack}>{t.back}</Button></div>
      </div>
    </div>
  );
}
