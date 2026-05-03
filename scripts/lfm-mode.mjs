#!/usr/bin/env node
// Swap @lossless-group/lfm between the local workspace and JSR.
//
//   pnpm lfm:local  — point at packages/lfm/ in the parent monorepo
//   pnpm lfm:jsr    — point at JSR (canonical, what Vercel needs)
//   pnpm lfm:auto   — pick based on the site's git branch
//
// Convention: branches in LOCAL_BRANCHES use the workspace; everything else
// (notably main/master, which is what Vercel deploys) uses JSR.
// Never commit a workspace-mode package.json/lockfile to a deployable branch.

import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const JSR_SPEC = 'npm:@jsr/lossless-group__lfm@^0.2.1';
const WORKSPACE_SPEC = 'workspace:^';
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
pkg.dependencies['@lossless-group/lfm'] = mode === 'local' ? WORKSPACE_SPEC : JSR_SPEC;
writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');

const npmrc = readFileSync('.npmrc', 'utf8')
  .split('\n')
  .filter((l) => !/^\s*ignore-workspace\s*=/.test(l));
const flagLine = `ignore-workspace=${mode === 'jsr' ? 'true' : 'false'}`;
writeFileSync('.npmrc', [flagLine, ...npmrc].join('\n').replace(/\n{3,}/g, '\n\n'));

console.log(`→ ${mode === 'local' ? 'workspace LFM' : 'JSR LFM'}; regenerating lockfile...`);
execSync(
  `pnpm install --lockfile-only ${mode === 'jsr' ? '--ignore-workspace' : ''}`.trim(),
  { stdio: 'inherit' }
);
