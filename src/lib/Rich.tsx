import type { ReactNode } from 'react';
import katex from 'katex';

const MATH = /(?<!\\)\$\$(.+?)(?<!\\)\$\$|(?<!\\)\$(.+?)(?<!\\)\$/g;
const MARK = /\*\*(.+?)\*\*/g;

function Bold({ text }: { text: string }) {
  const parts = text.replace(/\\\$/g, '$').split(MARK);
  return <>{parts.map((p, k) => (k % 2 ? <b className="kw" key={k}>{p}</b> : p))}</>;
}

// Content text: **keyword** and $LaTeX$. MathML needs no math font; the HTML comes from KaTeX over our own content files.
export function Rich({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let last = 0, key = 0;
  for (const m of text.matchAll(MATH)) {
    out.push(<Bold key={key++} text={text.slice(last, m.index)} />);
    const html = katex.renderToString(m[1] ?? m[2], { output: 'mathml', displayMode: m[1] !== undefined, throwOnError: false });
    out.push(<span key={key++} dangerouslySetInnerHTML={{ __html: html }} />);
    last = m.index + m[0].length;
  }
  out.push(<Bold key={key} text={text.slice(last)} />);
  return <>{out}</>;
}
