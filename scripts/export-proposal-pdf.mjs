#!/usr/bin/env node
/**
 * Export a proposal to PDF.
 *
 * Renders the /print route in headless Chrome and prints it to PDF. Chrome
 * rather than WeasyPrint — which is what memopop-orchestrator uses — because
 * this document contains a Vega-Lite chart, and WeasyPrint does not execute
 * JavaScript, so the chart would come out blank.
 *
 * The PDF is generated FROM the live route, so it reflects the markdown as it
 * stands. There is no second copy of the content to drift.
 *
 *   pnpm proposal:pdf <slug>
 *   pnpm proposal:pdf <slug> --port 4340 --version 2
 *
 * Output: public/promote/<slug>/<slug>-proposal-v<n>.pdf
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, existsSync, statSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith('--'));
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

if (!slug) {
  console.error('Usage: pnpm proposal:pdf <slug> [--port 4340] [--code <passcode>] [--version 1]');
  process.exit(1);
}

const port = flag('port', '4340');
const version = flag('version', '');
const base = `http://127.0.0.1:${port}`;
const printPath = `${base}/proposals/${slug}/print`;

if (!existsSync(CHROME)) {
  console.error(`Chrome not found at ${CHROME}`);
  process.exit(1);
}

const token = process.env.PROMOTE_EXPORT_TOKEN
  || flag('token', '')
  || readEnvToken();

function readEnvToken() {
  try {
    const env = execFileSync('cat', ['.env'], { encoding: 'utf8' });
    return (env.match(/^PROMOTE_EXPORT_TOKEN=(.*)$/m) ?? [])[1]?.trim() ?? '';
  } catch { return ''; }
}

if (!token) {
  console.error('No PROMOTE_EXPORT_TOKEN — set it in .env or pass --token.');
  process.exit(1);
}

const out = resolve(`public/proposals/${slug}/${slug}-proposal${version ? `-v${version}` : ''}.pdf`);
mkdirSync(dirname(out), { recursive: true });

const qs = new URLSearchParams({ export_token: token });
if (version) qs.set('v', version);
const printUrl = `${printPath}?${qs}`;
console.log(`→ rendering ${printPath}`);

// TWO PASSES, on purpose.
//
// Chrome's --print-to-pdf does not wait for an async module import to resolve,
// so printing the live URL produced a PDF with both charts missing while the
// very same page rendered them fine under --dump-dom. So: snapshot the fully
// rendered DOM first (vega has drawn its SVG inline by then), then print the
// snapshot from disk. No network race, and the chart is vector in the output.
const snapshot = `/tmp/proposal-${slug}.html`;
const dom = execFileSync(CHROME, [
  '--headless=new', '--disable-gpu',
  '--virtual-time-budget=25000',
  '--run-all-compositor-stages-before-draw',
  '--dump-dom', printUrl,
], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });

// Charts are server-rendered to inline SVG now, so the marker to check for is
// an <svg> inside the canvas — not the `data-vega-drawn` flag the old
// client-side renderer set, which no longer exists and reported 0/2 forever.
const drawn = (dom.match(/lfm-vega__canvas[^>]*>\s*<svg/g) ?? []).length;
const charts = (dom.match(/lfm-vega"/g) ?? []).length;
if (charts && drawn < charts) {
  console.warn(`  ! ${drawn}/${charts} charts drew before snapshot — PDF may be missing one`);
} else if (charts) {
  console.log(`  ${drawn}/${charts} charts drawn into the snapshot`);
}
writeFileSync(snapshot, dom);

execFileSync(CHROME, [
  '--headless=new', '--disable-gpu', '--no-pdf-header-footer',
  '--virtual-time-budget=10000',
  '--run-all-compositor-stages-before-draw',
  `--print-to-pdf=${out}`,
  `file://${snapshot}`,
], { stdio: 'inherit' });

if (!existsSync(out)) {
  console.error('Chrome produced no file.');
  process.exit(1);
}
const kb = (statSync(out).size / 1024).toFixed(0);
console.log(`\n✓ ${out}\n  ${kb} KB`);
