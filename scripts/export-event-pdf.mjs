#!/usr/bin/env node
/**
 * Export an event plan to PDF, in the site's own screen theme.
 *
 * Same two-pass approach as export-proposal-pdf.mjs: snapshot the rendered DOM
 * in headless Chrome, then print the snapshot. Unlike the proposal there is no
 * light print stylesheet here — the point is the mpstaton.com colors — so the
 * snapshot gets a small injected style: keep backgrounds, paint the page
 * margins in the theme background, and drop the site header and footer.
 *
 *   pnpm event:pdf <slug> <event>
 *   pnpm event:pdf <slug> <event> --port 4330
 *
 * Output: public/proposals/<slug>/<slug>-<event>.pdf
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, existsSync, statSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const args = process.argv.slice(2);
const [slug, event] = args.filter((a) => !a.startsWith('--'));
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

if (!slug || !event) {
  console.error('Usage: pnpm event:pdf <slug> <event> [--port 4340] [--token <export token>]');
  process.exit(1);
}
if (!existsSync(CHROME)) {
  console.error(`Chrome not found at ${CHROME}`);
  process.exit(1);
}

function readEnvToken() {
  try {
    const env = execFileSync('cat', ['.env'], { encoding: 'utf8' });
    return (env.match(/^PROMOTE_EXPORT_TOKEN=(.*)$/m) ?? [])[1]?.trim() ?? '';
  } catch { return ''; }
}

const token = process.env.PROMOTE_EXPORT_TOKEN || flag('token', '') || readEnvToken();
if (!token) {
  console.error('No PROMOTE_EXPORT_TOKEN — set it in .env or pass --token.');
  process.exit(1);
}

// localhost, not 127.0.0.1: astro dev can bind IPv6 only.
const base = `http://localhost:${flag('port', '4340')}`;
const pagePath = `${base}/proposals/${slug}/events/${event}`;
const out = resolve(`public/proposals/${slug}/${slug}-${event}.pdf`);
mkdirSync(dirname(out), { recursive: true });

console.log(`→ rendering ${pagePath}`);
let dom = execFileSync(CHROME, [
  '--headless=new', '--disable-gpu',
  '--virtual-time-budget=15000',
  '--run-all-compositor-stages-before-draw',
  '--dump-dom', `${pagePath}?${new URLSearchParams({ export_token: token })}`,
], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });

if (!dom.includes('<article')) {
  console.error('Snapshot has no <article> — the gate probably rejected the export token.');
  process.exit(1);
}

const printStyle = `
<base href="${base}/">
<style>
  @page { size: Letter; margin: 0.6in 0.5in; }
  html, body {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  html { background: var(--color-background) !important; }
  body > header, body > footer, body > nav, [data-session-toast] { display: none !important; }
  article > a:first-child { display: none !important; }
  article { padding-top: 0 !important; }
  tr, pre, blockquote { break-inside: avoid; }
  h2, h3 { break-after: avoid; }
</style>
<script>
  // Chrome leaves @page margins white unless the @page rule itself carries a
  // background, and @page cannot read custom properties. Resolve the theme
  // background here and write it in as a literal.
  addEventListener('DOMContentLoaded', () => {
    const bg = getComputedStyle(document.body).backgroundColor;
    const style = document.createElement('style');
    style.textContent = '@page { background: ' + bg + '; }';
    document.head.append(style);
  });
</script>`;
dom = dom.replace(/<head([^>]*)>/i, `<head$1>${printStyle}`);

const snapshot = `/tmp/event-${slug}-${event}.html`;
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
console.log(`\n✓ ${out}\n  ${(statSync(out).size / 1024).toFixed(0)} KB`);
