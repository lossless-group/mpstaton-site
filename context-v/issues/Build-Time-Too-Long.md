---
site_uuid: 4ca8cd15-bf71-465d-8cd4-0e5cfda657e6
hex_code: 7jrc9m
title: "Build Time Too Long"
lede: "A push takes about two minutes to deploy, but Astro compiles the site in six seconds. The rest is probably refetching content from scratch."
summary: "Open issue: mpstaton-site's Vercel deploys take ~2 min while `astro build` alone takes ~6 s locally. Leading hypothesis is that `pnpm build` runs `fetch-all` (GitHub API for context-v and essays, YouTube API for playlists) against caches that are gitignored and so start cold on every Vercel build. Lists the evidence, the hypotheses in order, and the measurements to take next. No fix attempted yet."
publish: true
date_created: 2026-10-04
date_modified: 2026-10-04
date_authored_initial_draft: 2026-10-04
date_authored_current_draft: 2026-10-04
date_authored_final_draft:
authors:
  - Michael Staton
augmented_with:
  - Claude Code on Claude Opus 5.5 (1M context)
at_semantic_version: 0.0.0.1
status: Open
tags:
  - Issue-Resolution
  - Build-Performance
  - Vercel
  - Astro
---

# Build Time Too Long

## Why Care?

Every push to this site takes about two minutes to go live. That's slow for how
little the site is, and it adds up when the work is iterative: a dashboard
tweak, a log entry, a typo. Two minutes per push means waiting longer than
the edit took.

## What we observed (2026-10-04)

| Measurement | Time | Source |
|---|---|---|
| `pnpm exec astro build` locally (no content fetch) | ~6 s (server built in 6.01 s) | local run |
| Push → Vercel Preview deployment ready, commit `68ad85a` | ~2 min (pushed ~02:04:50Z, ready 02:06:56Z) | GitHub deployments API |
| Same commit, Production deployment | ready 02:09:23Z, ~2.5 min after the Preview | GitHub deployments API |
| For comparison: hope-ai splash on GitHub Pages | 35–43 s per run | `gh run list` |

The Astro compile isn't the bottleneck. Whatever is slow happens before it or
around it.

## Hypotheses, most likely first

1. **Every build refetches all content, cold.** `pnpm build` is
   `pnpm fetch-all && astro build`, and `fetch-all` runs three network fetchers
   one after another:
   - `fetch-context-v.ts`: GitHub API, a tree walk plus a request per file,
     for the repos in `context-v-sources.yaml`
   - `fetch-essays.ts`: GitHub API for `lossless-group/lossless-content/essays/`
   - `fetch-youtube-playlists.ts`: YouTube Data API for every playlist URL in
     `src/content/`

   Each has a SHA- or TTL-keyed cache (`.context-v-cache/`, `.essays-cache/`,
   `src/data/youtube-playlist-cache.json`). But **those caches and the fetched
   output are all gitignored**, and Vercel doesn't keep arbitrary dot-directories
   between builds. So on Vercel every cache is probably cold every time, and the
   whole corpus is downloaded on every push.
2. **Two deployments per push.** The same commit got a Preview and then a
   Production deployment about 2.5 minutes apart. If Production is a full rebuild
   rather than a promotion, every push pays for the build twice. Check the
   project's Git settings for which branch is Production.
3. **Unauthenticated or throttled GitHub requests.** Both GitHub fetchers send a
   token only if one is set. Without `GITHUB_TOKEN` on Vercel, they share a
   60-request-an-hour limit, and any backoff or retry would stretch the build.
4. **Install and function bundling.** `pnpm install` plus the
   `@astrojs/vercel` server bundle are fixed costs, probably 20–40 s on a warm
   install cache. Worth measuring, but they can't explain two minutes alone.

## Next steps (measure before fixing)

- [ ] Open the Vercel build log for `68ad85a` and read the timing of each phase:
      install, each `fetch-*` script, `astro build`, function bundling.
- [ ] Locally, run `time pnpm fetch-context -- --fresh` and
      `time pnpm fetch-essays -- --fresh` to see a cold-cache fetch.
- [ ] Check whether `GITHUB_TOKEN` is set on the Vercel project.
- [ ] Check why one push made both a Preview and a Production deployment.

## Possible fixes (once measured)

- Keep the fetch caches inside a directory Vercel restores between builds
  (e.g. under `node_modules/.cache/`), so unchanged content is skipped.
- Run the fetchers in parallel rather than in sequence (`fetch-all` uses `&&`).
- Skip a fetcher when its source repo's HEAD SHA hasn't changed: one API call
  instead of a tree walk.
- Move content fetching to a scheduled job that commits the result, so a code
  push doesn't wait on content.

## Related

- `package.json` (`build`, `fetch-all` scripts)
- `scripts/fetch-context-v.ts`, `scripts/fetch-essays.ts`, `scripts/fetch-youtube-playlists.ts`
- `context-v-sources.yaml`
- `astro.config.*` (`output: 'server'`, `@astrojs/vercel`)
