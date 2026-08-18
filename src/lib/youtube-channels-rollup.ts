/**
 * Pure channel-rollup logic — no fs, no import.meta.glob, no Vite.
 *
 * This lives apart from youtube-channels.ts so both consumers can share one
 * definition of the ranking. The site reaches the cache through
 * import.meta.glob, which only exists inside Vite; scripts/ runs under Bun and
 * reads the same JSON off disk. A module importing either mechanism is
 * unusable from the other runtime, so the shared part imports neither and each
 * caller passes the playlists in.
 */

import type { PlaylistCacheEntry } from './youtube-playlist-types';

/** Channels below this many videos are left off the page. */
export const MIN_VIDEOS = 10;

export interface ChannelRollup {
  /** UC... id. Absent only for pre-fix cache entries; the URL falls back to search. */
  channelId?: string;
  title: string;
  videoCount: number;
  /** Labels of the curated playlists this channel shows up in. */
  playlists: string[];
}

export interface RollupInput {
  label: string;
  entry: PlaylistCacheEntry | null;
}

/**
 * Keyed by channelId where we have one. Two channels can share a display name
 * and one channel can rename itself, so the id is the identity whenever the
 * API gave us one; the title is only a fallback key for entries cached before
 * videoOwnerChannelId was recorded.
 */
export function rollupChannels(inputs: RollupInput[]): Map<string, ChannelRollup> {
  const byKey = new Map<string, ChannelRollup>();

  for (const { label, entry } of inputs) {
    if (!entry) continue;

    for (const item of entry.items) {
      // Private and deleted videos carry no owner at all — nothing to credit.
      if (!item.channelTitle) continue;

      const key = item.channelId ?? `title:${item.channelTitle}`;
      const existing = byKey.get(key);

      if (existing) {
        existing.videoCount++;
        if (!existing.playlists.includes(label)) existing.playlists.push(label);
      } else {
        byKey.set(key, {
          channelId: item.channelId,
          title: item.channelTitle,
          videoCount: 1,
          playlists: [label],
        });
      }
    }
  }

  return byKey;
}

/** Channels at or above `min`, most-watched first, ties broken by name. */
export function rankChannels(
  byKey: Map<string, ChannelRollup>,
  min: number = MIN_VIDEOS
): ChannelRollup[] {
  return [...byKey.values()]
    .filter((c) => c.videoCount >= min)
    .sort((a, b) => b.videoCount - a.videoCount || a.title.localeCompare(b.title));
}

/** Channel page URL, or a search fallback when the cache predates channelId. */
export function channelUrl(c: ChannelRollup): string {
  return c.channelId
    ? `https://www.youtube.com/channel/${c.channelId}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(c.title)}`;
}
