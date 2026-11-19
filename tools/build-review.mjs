// Builds the single-page midterm review artifact from content files.
// Usage: node tools/build-review.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import katex from 'katex';
import { renderFigures } from '../content/midterm/figures.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFileSync(join(root, p), 'utf8');
const figures = renderFigures();

// Markdown outline (# root, ## branch, nested "- " items) -> { t, c: [] }
function parseMindmap(md) {
  let tree = null;
  const stack = [];
  for (const line of md.split(/\r?\n/)) {
    if (!line.trim()) continue;
    let m;
    if ((m = line.match(/^# (.+)/))) {
      tree = { t: m[1].trim(), c: [] };
      stack.length = 0;
      stack.push({ d: -1, n: tree });
    } else if ((m = line.match(/^## (.+)/))) {
      const n = { t: m[1].trim(), c: [] };
      tree.c.push(n);
      stack.length = 1;
      stack.push({ d: 0, n });
    } else if ((m = line.match(/^(\s*)- (.+)/))) {
      const d = 1 + Math.floor(m[1].replace(/\t/g, '  ').length / 2);
      const n = { t: m[2].trim(), c: [] };
      while (stack.at(-1).d >= d) stack.pop();
      stack.at(-1).n.c.push(n);
      stack.push({ d, n });
    }
  }
  return tree;
}

// Lesson file: "## id | vi | en" levels, "@card src [fig=x] [svg=x] [real]" cards, ":vi"/":en" bodies.
function parseLesson(md, w) {
  const secs = [];
  let card = null, lang = null;
  for (const line of md.replace(/<!--[\s\S]*?-->/g, '').split(/\r?\n/)) {
    let m;
    if ((m = line.match(/^## (\S+) \| (.+?) \| (.+)$/))) {
      secs.push({ id: m[1], t: { vi: m[2].trim(), en: m[3].trim() }, cards: [] });
      card = null;
    } else if ((m = line.match(/^@card (\S+)(.*)$/))) {
      card = { src: m[1], vi: '', en: '' };
      for (const f of m[2].trim().split(/\s+/).filter(Boolean)) {
        const [k, v] = f.split('=');
        card[k] = v ?? true;
      }
      secs.at(-1).cards.push(card);
      lang = null;
    } else if (line === ':vi' || line === ':en') {
      lang = line.slice(1);
    } else if (card && lang) {
      card[lang] += line + '\n';
    }
  }
  for (const s of secs) for (const c of s.cards) {
    c.vi = c.vi.trim(); c.en = c.en.trim();
    if (!c.vi || !c.en) throw new Error(`w${w} ${s.id} ${c.src}: missing vi or en`);
    // Slide images stay out of the site: lessons use diagrams drawn for SE Quest.
    if (c.img) throw new Error(`w${w} ${s.id}: slide images are not allowed, use fig=`);
    if (c.fig && !figures[c.fig]) throw new Error(`w${w} ${s.id}: figure ${c.fig} not found`);
  }
  return secs;
}

const quiz = JSON.parse(read('content/midterm/quiz.json'));
const cards = JSON.parse(read('content/midterm/flashcards.json'));
const glossary = JSON.parse(read('content/midterm/glossary.json'));
const maps = {}, lessons = {}, checks = {};
for (const w of [1, 2, 3, 4, 5]) {
  // Per-level quick checks: the correct option is written first in the source and shuffled at runtime.
  for (const [lv, qs] of Object.entries(JSON.parse(read(`content/midterm/checks/w${w}.json`)))) {
    checks[lv] = qs.map((q, k) => {
      if (q.o.length !== 4 || new Set(q.o).size !== 4) throw new Error(`check ${lv}#${k + 1}: needs 4 distinct options`);
      if (!q.vi || !q.en || !q.src) throw new Error(`check ${lv}#${k + 1}: missing vi, en or src`);
      // ng: abbreviation questions skip glossary links in the prompt, which would give the answer away.
      return { id: `c${lv}-${k + 1}`, w, lv, q: q.q, o: q.o, a: 0, vi: q.vi, en: q.en, src: q.src, ...(q.ng && { ng: 1 }) };
    });
  }
  const vi = parseMindmap(read(`content/midterm/mindmaps/world-${w}.vi.md`));
  const en = parseMindmap(read(`content/midterm/mindmaps/world-${w}.en.md`));
  // Both languages must have the same shape so the self-test hides the same items.
  const count = n => 1 + n.c.reduce((s, k) => s + count(k), 0);
  if (count(vi) !== count(en)) throw new Error(`world-${w}: vi has ${count(vi)} nodes, en has ${count(en)}`);
  maps[w] = { vi, en };
  lessons[w] = parseLesson(read(`content/midterm/lessons/w${w}.md`), w);
  for (const s of lessons[w]) if (!checks[s.id]?.length) throw new Error(`level ${s.id} has no quick check`);
}

// Pre-render every $…$ / $$…$$ to MathML so the page needs no math library or fonts.
const math = {};
const MATH = /(?<!\\)\$\$(.+?)(?<!\\)\$\$|(?<!\\)\$(.+?)(?<!\\)\$/g;
const collect = v => {
  if (typeof v === 'string') {
    for (const m of v.matchAll(MATH)) {
      const display = m[1] !== undefined, tex = display ? m[1] : m[2];
      const key = (display ? 'D:' : 'I:') + tex;
      math[key] ??= katex.renderToString(tex, { output: 'mathml', displayMode: display, throwOnError: true, strict: false });
    }
  } else if (v && typeof v === 'object') Object.values(v).forEach(collect);
};
const data = { examDate: '2026-11-05', quiz, cards, maps, lessons, checks, glossary };
collect(data);
data.math = math;
data.figures = figures;

const html = read('tools/review-template.html')
  .replace('/*__FIGCSS__*/', () => read('content/midterm/figures.css'))
  .replace('/*__DATA__*/null', () => JSON.stringify(data).replaceAll('</', '<\\/'));
mkdirSync(join(root, 'review'), { recursive: true });
writeFileSync(join(root, 'review/se-quest-on-giua-ky.html'), html);
const nCards = Object.values(lessons).flat().reduce((s, x) => s + x.cards.length, 0);
console.log(`built review/se-quest-on-giua-ky.html · ${quiz.length} questions · ${cards.length} flashcards · ${nCards} lesson cards · ${Object.values(checks).flat().length} check questions · ${glossary.length} terms · ${Object.keys(math).length} formulas · ${(html.length / 1024).toFixed(0)} KB`);
