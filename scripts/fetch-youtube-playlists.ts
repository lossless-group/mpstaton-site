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
  channelTitle?: string;
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
  fetchedAt: string; // ISO timestamp
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
      channelTitle?: string;
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
      channelTitle: it.snippet.channelTitle,
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

async function main() {
  const key = process.env.YOUTUBE_API_KEY;
  const ids = await discoverPlaylistIds();
  console.log(`📺 YouTube playlist fetcher — discovered ${ids.size} unique playlist ID${ids.size === 1 ? '' : 's'} in src/content/`);

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

  await writeCache(next);
  console.log(`✓ Done. ${fetched} fetched, ${skipped} skipped (cache fresh), ${failed} failed.`);
}

main().catch((err) => {
  console.error('fetch-youtube-playlists failed:', err);
  process.exit(1);
});
