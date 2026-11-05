const KEY = 'sq-progress-v1';

export type Lang = 'vi' | 'en';
export type Progress = { xp: number; seen: Record<number, string[]>; wrong: string[]; lang: Lang };

export const fresh = (): Progress => ({ xp: 0, seen: {}, wrong: [], lang: 'vi' });

// Storage can throw in private windows; the game still runs, it just forgets.
export function load(): Progress {
  try { return { ...fresh(), ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }; } catch { return fresh(); }
}
export function save(p: Progress) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* see load() */ }
}

export function recordAnswer(p: Progress, w: number, id: string, right: boolean, xp: number): Progress {
  const seen = p.seen[w] ?? [];
  return {
    ...p,
    xp: right ? p.xp + xp : p.xp,
    seen: { ...p.seen, [w]: seen.includes(id) ? seen : [...seen, id] },
    wrong: right || p.wrong.includes(id) ? p.wrong : [...p.wrong, id],
  };
}
