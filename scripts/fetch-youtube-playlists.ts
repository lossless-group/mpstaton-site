/**
 * fetch-youtube-playlists — build-time fetcher for YouTube playlist metadata.
 *
 * Walks src/content/ for any `youtube.com/playlist?list={id}` URL, dedupes the
 * set of playlist IDs, and pulls each playlist's metadata + items + per-item
 * durations from the YouTube Data API v3. Writes the result to
 * src/data/youtube-playlist-cache.json (gitignored), keyed by playlist ID.
 *
 * Spec: context-v/specs/Versatile-Component-Library-for-Video-Players.md §4.1.3
 *
 * Quota cost per playlist (cold cache): roughly 3 units —
 *   1 (playlists) + 1 per page of 50 items (playlistItems) + 1 per 50 video IDs (videos).
 * The free tier is 10,000 units/day. Default TTL is 30 days.
 *
 * Run: pnpm fetch-playlists  (also chained into pnpm fetch-all)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { PLAYLISTS } from '../src/config/playlists';

const SITE_ROOT = path.resolve(import.meta.dirname, '..');
const CONTENT_DIR = path.join(SITE_ROOT, 'src', 'content');
const CACHE_PATH = path.join(SITE_ROOT, 'src', 'data', 'youtube-playlist-cache.json');

const API_BASE = 'https://www.googleapis.com/youtube/v3';
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const PLAYLIST_URL_RE = /https?:\/\/(?:www\.|m\.)?youtube\.com\/playlist\?[^\s)]*?\blist=([A-Za-z0-9_-]+)/g;

interface PlaylistItem {
  videoId: string;
  position: number;
  title: string;
  thumbnail: string;
  duration?: string; // ISO 8601 — PT4M30S
  addedAt?: string;  // ISO timestamp when the video was added to the playlist
  channelTitle?: string; // the channel the video lives on (videoOwnerChannelTitle)
  channelId?: string;    // UC... id for that channel (videoOwnerChannelId)
  unavailable?: boolean;
}

interface PlaylistCacheEntry {
  id: string;
  title: string;
  description?: string;
  channelTitle: string;
  channelId: string;
  itemCount: number;
  thumbnail: string;
  fetchedAt: string; // ISO timestamp — anchors the 30-day ITEMS ttl
  countsFetchedAt?: string; // ISO timestamp — anchors the per-build COUNTS refresh
  items: PlaylistItem[];
  unavailable?: boolean;
}

interface PlaylistCache {
  [playlistId: string]: PlaylistCacheEntry;
}

async function walkMarkdownFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...await walkMarkdownFiles(full));
    } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
      out.push(full);
    }
  }
  return out;
}

async function discoverPlaylistIds(): Promise<Set<string>> {
  const ids = new Set<string>();

  // Curated playlists come first: /playlists surfaces them whether or not any
  // markdown file mentions them, so scraping content alone would leave the
  // page's own playlists uncached and stuck in facade mode.
  for (const p of PLAYLISTS) ids.add(p.id);

  const files = await walkMarkdownFiles(CONTENT_DIR);
  for (const file of files) {
    const raw = await fs.readFile(file, 'utf8');
    let match: RegExpExecArray | null;
    PLAYLIST_URL_RE.lastIndex = 0;
    while ((match = PLAYLIST_URL_RE.exec(raw)) !== null) {
      ids.add(match[1]);
    }
  }
  return ids;
}

async function loadCache(): Promise<PlaylistCache> {
  try {
    const raw = await fs.readFile(CACHE_PATH, 'utf8');
    return JSON.parse(raw) as PlaylistCache;
  } catch {
    return {};
  }
}

async function writeCache(cache: PlaylistCache): Promise<void> {
  await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true });
  await fs.writeFile(CACHE_PATH, JSON.stringify(cache, null, 2) + '\n', 'utf8');
}

function isFresh(entry: PlaylistCacheEntry | undefined): boolean {
  if (!entry) return false;
  const age = Date.now() - new Date(entry.fetchedAt).getTime();
  return age < TTL_MS;
}

interface YTPlaylistResponse {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      description?: string;
      channelId: string;
      channelTitle: string;
      thumbnails?: Record<string, { url: string; width: number; height: number }>;
    };
    contentDetails: { itemCount: number };
  }>;
}

interface YTPlaylistItemsResponse {
  nextPageToken?: string;
  items: Array<{
    snippet: {
      position: number;
      title: string;
      publishedAt: string; // when added to playlist
      // NOTE: snippet.channelTitle/channelId here identify the account that ADDED
      // the item to the playlist — i.e. the playlist owner, identical for every
      // row. The channel the video actually lives on is videoOwnerChannel*.
      // Absent on private/deleted videos.
      videoOwnerChannelTitle?: string;
      videoOwnerChannelId?: string;
      thumbnails?: Record<string, { url: string; width: number; height: number }>;
      resourceId: { videoId: string };
    };
  }>;
}

interface YTVideosResponse {
  items: Array<{ id: string; contentDetails: { duration: string } }>;
}

function pickThumb(thumbs?: Record<string, { url: string }>): string {
  if (!thumbs) return '';
  return thumbs.maxres?.url ?? thumbs.high?.url ?? thumbs.medium?.url ?? thumbs.default?.url ?? '';
}

async function fetchPlaylistMeta(id: string, key: string): Promise<YTPlaylistResponse['items'][0] | null> {
  const url = `${API_BASE}/playlists?id=${id}&part=snippet,contentDetails&key=${key}`;
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`playlists ${id} → ${res.status} ${res.statusText}`);
  const data = (await res.json()) as YTPlaylistResponse;
  return data.items[0] ?? null;
}

async function fetchPlaylistItems(id: string, key: string): Promise<YTPlaylistItemsResponse['items']> {
  const all: YTPlaylistItemsResponse['items'] = [];
  let pageToken: string | undefined;
  do {
    const params = new URLSearchParams({
      playlistId: id,
      part: 'snippet,contentDetails',
      maxResults: '50',
      key,
    });
    if (pageToken) params.set('pageToken', pageToken);
    const res = await fetch(`${API_BASE}/playlistItems?${params}`);
    if (!res.ok) throw new Error(`playlistItems ${id} → ${res.status} ${res.statusText}`);
    const data = (await res.json()) as YTPlaylistItemsResponse;
    all.push(...data.items);
    pageToken = data.nextPageToken;
  } while (pageToken);
  return all;
}

async function fetchVideoDurations(videoIds: string[], key: string): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const url = `${API_BASE}/videos?id=${batch.join(',')}&part=contentDetails&key=${key}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`videos batch → ${res.status} ${res.statusText}`);
    const data = (await res.json()) as YTVideosResponse;
    for (const v of data.items) out.set(v.id, v.contentDetails.duration);
  }
  return out;
}

async function fetchPlaylist(id: string, key: string): Promise<PlaylistCacheEntry> {
  const meta = await fetchPlaylistMeta(id, key);
  if (!meta) {
    return {
      id,
      title: 'Unavailable playlist',
      channelTitle: '',
      channelId: '',
      itemCount: 0,
      thumbnail: '',
      fetchedAt: new Date().toISOString(),
      items: [],
      unavailable: true,
    };
  }
  const rawItems = await fetchPlaylistItems(id, key);
  const videoIds = rawItems
    .map((it) => it.snippet.resourceId.videoId)
    .filter((vId) => /^[A-Za-z0-9_-]{11}$/.test(vId));
  const durations = videoIds.length > 0 ? await fetchVideoDurations(videoIds, key) : new Map();

  const items: PlaylistItem[] = rawItems.map((it) => {
    const videoId = it.snippet.resourceId.videoId;
    const isPrivate = it.snippet.title === 'Private video' || it.snippet.title === 'Deleted video';
    return {
      videoId,
      position: it.snippet.position,
      title: it.snippet.title,
      thumbnail: pickThumb(it.snippet.thumbnails),
      duration: durations.get(videoId),
      addedAt: it.snippet.publishedAt,
      channelTitle: it.snippet.videoOwnerChannelTitle,
      channelId: it.snippet.videoOwnerChannelId,
      unavailable: isPrivate || undefined,
    };
  }).sort((a, b) => a.position - b.position);

  return {
    id,
    title: meta.snippet.title,
    description: meta.snippet.description,
    channelTitle: meta.snippet.channelTitle,
    channelId: meta.snippet.channelId,
    itemCount: meta.contentDetails.itemCount,
    thumbnail: pickThumb(meta.snippet.thumbnails),
    fetchedAt: new Date().toISOString(),
    items,
  };
}

/**
 * Refresh title + itemCount for every id in ONE call, without re-pulling items.
 *
 * The 30-day TTL on `fetchedAt` exists because a full fetch of these playlists
 * costs ~241 quota units — 119 pages of playlistItems plus 119 of videos. But
 * that TTL also froze the *counts*, so a build inside the window rendered
 * whatever number was true up to a month ago.
 *
 * `playlists.list` takes comma-separated ids and costs 1 unit total regardless
 * of how many playlists or videos are involved. So counts refresh on every
 * build for a single unit, while the expensive item list keeps its TTL.
 *
 * Deliberately does NOT touch `fetchedAt` — updating it here would reset the
 * items TTL and mean the item list never refreshed again.
 */
async function refreshCounts(
  ids: string[],
  key: string,
  cache: PlaylistCache
): Promise<number> {
  if (!ids.length) return 0;
  const url = `${API_BASE}/playlists?id=${ids.join(',')}&part=snippet,contentDetails&key=${key}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`playlists.list ${res.status} ${await res.text()}`);
  const json = (await res.json()) as YTPlaylistResponse;

  const now = new Date().toISOString();
  let updated = 0;
  for (const p of json.items ?? []) {
    const entry = cache[p.id];
    if (!entry) continue;
    const before = entry.itemCount;
    entry.title = p.snippet.title;
    entry.channelTitle = p.snippet.channelTitle;
    entry.itemCount = p.contentDetails.itemCount;
    entry.countsFetchedAt = now;
    if (before !== entry.itemCount) {
      updated++;
      const delta = entry.itemCount - before;
      console.log(`  ~ ${entry.title} — ${before} → ${entry.itemCount} (${delta >= 0 ? '+' : ''}${delta})`);
    }
  }
  return updated;
}

async function main() {
  const key = process.env.YOUTUBE_API_KEY;
  const ids = await discoverPlaylistIds();
  console.log(`📺 YouTube playlist fetcher — ${ids.size} unique playlist ID${ids.size === 1 ? '' : 's'} (${PLAYLISTS.length} curated + src/content/)`);

  if (ids.size === 0) {
    await writeCache({});
    return;
  }

  const existing = await loadCache();
  const next: PlaylistCache = { ...existing };

  if (!key) {
    console.warn('⚠️  YOUTUBE_API_KEY not set — playlist components will degrade to facade mode for any id without a cached entry.');
    for (const id of ids) {
      if (!next[id]) {
        next[id] = {
          id,
          title: 'YouTube playlist',
          channelTitle: '',
          channelId: '',
          itemCount: 0,
          thumbnail: '',
          fetchedAt: new Date().toISOString(),
          items: [],
          unavailable: true,
        };
      }
    }
    await writeCache(next);
    return;
  }

  let fetched = 0;
  let skipped = 0;
  let failed = 0;
  for (const id of ids) {
    if (isFresh(existing[id])) {
      skipped++;
      continue;
    }
    try {
      next[id] = await fetchPlaylist(id, key);
      fetched++;
      console.log(`  ✓ ${id} — ${next[id].title} (${next[id].items.length} items)`);
    } catch (err) {
      failed++;
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`  ✗ ${id} — ${msg}`);
      // Keep last-known-good if we have one; otherwise unavailable placeholder.
      if (!next[id]) {
        next[id] = {
          id,
          title: 'YouTube playlist',
          channelTitle: '',
          channelId: '',
          itemCount: 0,
          thumbnail: '',
          fetchedAt: new Date().toISOString(),
          items: [],
          unavailable: true,
        };
      }
    }
  }

  // Counts refresh on EVERY build for 1 quota unit, even for entries whose
  // items were skipped as fresh — otherwise a build inside the 30-day window
  // renders a subscriber-facing number that is up to a month stale.
  let countsChanged = 0;
  const skippedIds = [...ids].filter((id) => next[id] && !next[id].unavailable);
  if (skippedIds.length) {
    try {
      countsChanged = await refreshCounts(skippedIds, key, next);
    } catch (err) {
      // Never fail a build over a counter. The cached number is still shown.
      console.warn(`  ! counts refresh failed, keeping cached counts — ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  await writeCache(next);
  const totalItems = Object.values(next).reduce((n, e) => n + (e.itemCount ?? 0), 0);
  console.log(
    `✓ Done. ${fetched} fetched, ${skipped} skipped (items cache fresh), ${failed} failed; ` +
    `counts refreshed for ${skippedIds.length} (${countsChanged} changed), ${totalItems.toLocaleString()} videos total.`
  );
}

main().catch((err) => {
  console.error('fetch-youtube-playlists failed:', err);
  process.exit(1);
});
