/**
 * seed-channel-favorites — keep src/config/channel-favorites.json in step with
 * the playlist cache WITHOUT touching the hand-set flags in it.
 *
 * The favorites list is editorial: which channels are worth calling out is a
 * judgement the cache cannot make. But hunting 100+ UC... ids by hand to write
 * that judgement down is pure tedium, so this seeds every channel above the
 * threshold with favorite:false and leaves picking to a human.
 *
 * Idempotent and additive: existing entries keep their flags and notes, new
 * channels arrive as favorite:false, and channels that fall below the
 * threshold are LEFT IN PLACE rather than dropped — deleting someone's
 * curation because a playlist shifted would be the one unrecoverable move.
 *
 * Run: pnpm seed-channels  (after pnpm fetch-playlists)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { PLAYLISTS } from '../src/config/playlists';
import { rollupChannels, rankChannels } from '../src/lib/youtube-channels-rollup';
import type { PlaylistCacheEntry } from '../src/lib/youtube-playlist-types';

const SITE_ROOT = path.resolve(import.meta.dirname, '..');
const FILE = path.join(SITE_ROOT, 'src', 'config', 'channel-favorites.json');
const CACHE = path.join(SITE_ROOT, 'src', 'data', 'youtube-playlist-cache.json');

interface FavoriteEntry {
  /** Carried for human readability while hand-editing; the cache title wins at render. */
  title: string;
  favorite: boolean;
  note?: string;
}

async function main() {
  // Read the cache off disk rather than through src/lib/youtube-playlist-cache,
  // which reaches it via import.meta.glob — a Vite construct that does not
  // exist under Bun. The ranking itself is still the shared one.
  let cache: Record<string, PlaylistCacheEntry> = {};
  try {
    cache = JSON.parse(await fs.readFile(CACHE, 'utf8'));
  } catch {
    console.error('no playlist cache — run pnpm fetch-playlists first.');
    process.exit(1);
  }

  const channels = rankChannels(
    rollupChannels(PLAYLISTS.map((p) => ({ label: p.label, entry: cache[p.id] ?? null })))
  );

  let existing: Record<string, FavoriteEntry> = {};
  try {
    existing = JSON.parse(await fs.readFile(FILE, 'utf8'));
  } catch {
    console.log('no existing favorites file — seeding a fresh one');
  }

  const next: Record<string, FavoriteEntry> = { ...existing };
  let added = 0;

  for (const c of channels) {
    if (!c.channelId) continue; // nothing stable to key on
    if (next[c.channelId]) {
      // Refresh the readability label only; never touch the human's flags.
      next[c.channelId].title = c.title;
      continue;
    }
    next[c.channelId] = { title: c.title, favorite: false };
    added++;
  }

  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(next, null, 2) + '\n', 'utf8');

  const picked = Object.values(next).filter((e) => e.favorite).length;
  console.log(
    `✓ ${FILE.replace(SITE_ROOT + '/', '')} — ${Object.keys(next).length} channels ` +
    `(${added} new), ${picked} marked favorite.`
  );
}

main().catch((err) => {
  console.error('seed-channel-favorites failed:', err);
  process.exit(1);
});
