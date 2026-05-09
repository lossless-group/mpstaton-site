#!/usr/bin/env node
// Swap @lossless-group/lfm between the local checkout and JSR.
//
//   pnpm lfm:local  — point at /Users/mpstaton/code/lossless-monorepo/lfm via a
//                     relative `link:` path (lfm is a sibling of astro-knots,
//                     three dirs up from this site). Symlinked, so edits in
//                     lfm flow through to the site immediately.
//   pnpm lfm:jsr    — point at JSR (canonical, what Vercel needs).
//   pnpm lfm:auto   — pick based on the site's git branch.
//
// Convention: branches in LOCAL_BRANCHES use the local link; everything else
// (notably main/master, which is what Vercel deploys) uses JSR.
// Never commit a link-mode package.json/lockfile to a deployable branch — the
// `link:` path won't resolve on Vercel.
//
// Why `link:` not `workspace:^` — sites are intentionally NOT members of the
// astro-knots pnpm workspace (so they can deploy independently). The workspace
// protocol therefore can't resolve from a site. A relative `link:` path works
// regardless of workspace membership and keeps the site standalone.

import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const JSR_SPEC = 'npm:@jsr/lossless-group__lfm@0.3.0';
const LOCAL_SPEC = 'link:../../../lfm';
const LOCAL_BRANCHES = new Set(['development', 'develop', 'dev']);

const arg = process.argv[2] ?? 'auto';
const mode = arg === 'auto' ? autoDetect() : arg;
if (mode !== 'local' && mode !== 'jsr') {
  console.error(`Usage: lfm-mode.mjs <local|jsr|auto>`);
  process.exit(1);
}

function autoDetect() {
  const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  return LOCAL_BRANCHES.has(branch) ? 'local' : 'jsr';
}

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
pkg.dependencies['@lossless-group/lfm'] = mode === 'local' ? LOCAL_SPEC : JSR_SPEC;
writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');

console.log(`→ ${mode === 'local' ? 'local LFM (linked)' : 'JSR LFM'}; regenerating lockfile...`);
execSync('pnpm install --lockfile-only --ignore-workspace', { stdio: 'inherit' });
