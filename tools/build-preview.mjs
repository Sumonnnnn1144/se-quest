// Packs the Vite app into one HTML file, so an Artifact can show it on a phone. Usage: npm run build:preview
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { build } from 'vite';

const outDir = 'dist/preview';
await build({
  logLevel: 'warn',
  build: {
    outDir,
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
    chunkSizeWarningLimit: 4096,
    rolldownOptions: { output: { format: 'iife' } },
  },
});

// An IIFE build carries its CSS and fonts inside the one script.
const assets = join(outDir, 'assets'), script = readdirSync(assets).find(f => f.endsWith('.js'));
// A literal closing tag or comment opener would end or hide the inline script.
const js = readFileSync(join(assets, script), 'utf8').replaceAll('</script', '<\\/script').replaceAll('<!--', '<\\!--');
const out = join(outDir, 'se-quest-quiz-options.html');
writeFileSync(out, `<title>SE Quest Quiz Options</title>\n<div id="root"></div>\n<script>${js}</script>\n`);
console.log(`built ${out} · ${Math.round(readFileSync(out).length / 1024)} KB`);
