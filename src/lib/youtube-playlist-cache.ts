/**
 * Server-only loader for the build-time YouTube playlist cache produced by
 * scripts/fetch-youtube-playlists.ts. The cache is gitignored and rebuilt
 * by `pnpm fetch-playlists` (chained into pnpm dev / pnpm build).
 *
 * IMPORTANT: this module imports node:fs / node:url and must never be
 * pulled into a client bundle. Pure types and helpers live in
 * ./youtube-playlist-types so client-side Svelte components can share them.
 */

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { PlaylistCacheEntry } from './youtube-playlist-types';

export type { PlaylistCacheEntry, PlaylistItem } from './youtube-playlist-types';
export { formatDuration } from './youtube-playlist-types';

const CACHE_PATH = fileURLToPath(
  new URL('../data/youtube-playlist-cache.json', import.meta.url)
);

let cache: Record<string, PlaylistCacheEntry> | null = null;

function loadCache(): Record<string, PlaylistCacheEntry> {
  if (!existsSync(CACHE_PATH)) return {};
  try {
    return JSON.parse(readFileSync(CACHE_PATH, 'utf8'));
  } catch {
    return {};
  }
}

export function getPlaylist(id: string): PlaylistCacheEntry | null {
  if (cache === null) cache = loadCache();
  return cache[id] ?? null;
}
