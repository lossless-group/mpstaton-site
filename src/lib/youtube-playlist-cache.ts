/**
 * Server-only loader for the build-time YouTube playlist cache produced by
 * scripts/fetch-youtube-playlists.ts. The cache is gitignored and rebuilt
 * by `pnpm fetch-playlists` (chained into pnpm dev / pnpm build).
 *
 * The cache is pulled in through `import.meta.glob` rather than read off disk
 * at request time. This site is `output: 'server'`, so these pages render
 * inside a Vercel serverless function whose bundle contains only JS — the
 * gitignored JSON under src/data/ is never traced into it, and `import.meta.url`
 * resolves to dist/server/chunks/, so a `../data/` read would point at the
 * wrong place even if the file had been copied. Both failures are silent:
 * existsSync returns false, every lookup returns null, and the page renders
 * its "not cached yet" facade on a deploy whose fetcher actually succeeded.
 * Globbing makes Rollup inline the JSON into the chunk, so the data travels
 * with the code wherever the function runs.
 *
 * Glob rather than a plain `import` because the file is gitignored: on a clone
 * that has not run the fetcher a static import is a hard build failure, while
 * a glob matching nothing yields {} and degrades to facade mode as before.
 */

import type { PlaylistCacheEntry } from './youtube-playlist-types';

export type { PlaylistCacheEntry, PlaylistItem } from './youtube-playlist-types';
export { formatDuration } from './youtube-playlist-types';

type PlaylistCache = Record<string, PlaylistCacheEntry>;

const modules = import.meta.glob<{ default: PlaylistCache }>(
  '../data/youtube-playlist-cache.json',
  { eager: true }
);

const cache: PlaylistCache = Object.values(modules)[0]?.default ?? {};

export function getPlaylist(id: string): PlaylistCacheEntry | null {
  return cache[id] ?? null;
}
