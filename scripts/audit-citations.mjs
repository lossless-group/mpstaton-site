#!/usr/bin/env node
/**
 * Audit LFM hex-code citations across markdown content.
 *
 * Enforces the conventions in
 * `astro-knots/context-v/blueprints/Citation-System-Architecture.md`:
 *
 *   1. Inline references are preceded by a space  — `…faster. [^93fb63]`
 *   2. Hex codes are exactly 6 lowercase alphanumeric characters
 *   3. Every inline reference has a definition somewhere in the same file
 *   4. Every definition is referenced at least once
 *   5. No duplicate definitions of the same code within a file
 *
 * Rule 1 is the one that gets forgotten, because `.[^code]` parses fine and
 * renders as a superscript either way — it only shows up as a missing space
 * in the rendered page. Named siblings: `audit-wikilinks.ts`.
 *
 *   pnpm audit-citations                 # defaults to src/content
 *   pnpm audit-citations path/to/dir …   # explicit roots
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const HEX = '[A-Za-z0-9]+';
const INLINE = new RegExp(`\\[\\^(${HEX})\\](?!:)`, 'g');
const DEFINITION = /^\[\^([A-Za-z0-9]+)\]:/;
const WELL_FORMED = /^[a-z0-9]{6}$/;

const roots = process.argv.slice(2);
const targets = roots.length ? roots : ['src/content'];

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const entry of entries) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (entry.endsWith('.md')) out.push(full);
  }
  return out;
}

const problems = [];
const add = (file, line, rule, detail) =>
  problems.push({ file: relative(process.cwd(), file), line, rule, detail });

let scanned = 0;
for (const target of targets) {
  for (const file of walk(target)) {
    scanned++;
    const lines = readFileSync(file, 'utf-8').split('\n');
    const defined = new Map();
    const referenced = new Set();
    let inFence = false;

    lines.forEach((raw, i) => {
      const lineNo = i + 1;
      // Fenced blocks and inline code spans are illustrations, not citations —
      // the citation spec's own docs are full of `[^hexcode]` placeholders.
      if (/^\s*(```|~~~)/.test(raw)) { inFence = !inFence; return; }
      if (inFence) return;
      const text = raw.replace(/`[^`]*`/g, (m) => ' '.repeat(m.length));
      const def = text.match(DEFINITION);
      if (def) {
        const code = def[1];
        if (defined.has(code)) add(file, lineNo, 'duplicate-definition', `[^${code}] also defined on line ${defined.get(code)}`);
        else defined.set(code, lineNo);
        if (!WELL_FORMED.test(code)) add(file, lineNo, 'malformed-hex', `[^${code}] must be 6 lowercase alphanumerics`);
        return; // a definition line carries no inline refs
      }
      for (const m of text.matchAll(INLINE)) {
        const code = m[1];
        referenced.add(code);
        if (!WELL_FORMED.test(code)) add(file, lineNo, 'malformed-hex', `[^${code}] must be 6 lowercase alphanumerics`);
        const before = m.index > 0 ? text[m.index - 1] : ' ';
        if (before !== ' ' && before !== '\t') {
          add(file, lineNo, 'missing-space', `"${before}[^${code}]" — needs a space before the reference`);
        }
      }
    });

    for (const code of referenced) if (!defined.has(code)) add(file, 0, 'undefined-reference', `[^${code}] referenced, never defined`);
    for (const [code, lineNo] of defined) if (!referenced.has(code)) add(file, lineNo, 'orphan-definition', `[^${code}] defined, never referenced`);
  }
}

const byRule = problems.reduce((acc, p) => ((acc[p.rule] = (acc[p.rule] ?? 0) + 1), acc), {});
console.log(`Scanned ${scanned} markdown files under: ${targets.join(', ')}\n`);

if (!problems.length) {
  console.log('✓ No citation convention violations.');
  process.exit(0);
}
for (const [rule, n] of Object.entries(byRule).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(4)}  ${rule}`);
}
console.log();
for (const p of problems.slice(0, 40)) {
  console.log(`${p.file}:${p.line || '?'}  [${p.rule}] ${p.detail}`);
}
if (problems.length > 40) console.log(`… and ${problems.length - 40} more`);
process.exit(1);
