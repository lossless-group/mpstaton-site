/**
 * youtube-channels — roll the cached playlist items up into a per-channel view.
 *
 * Derived at build time from the same cache /playlists renders from, so this
 * surface has no fetch of its own and no list to hand-maintain: adding videos
 * to a playlist moves a channel up the page on the next deploy.
 *
 * Server-only, like the cache it reads.
 */

import { PLAYLISTS } from '../config/playlists';
import { getPlaylist } from './youtube-playlist-cache';

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

/**
 * Keyed by channelId where we have one. Two channels can share a display name
 * and one channel can rename itself, so the id is the identity whenever the
 * API gave us one; the title is only a fallback key for the 44 private/deleted
 * items and any entry cached before videoOwnerChannelId was recorded.
 */
function collect(): Map<string, ChannelRollup> {
  const byKey = new Map<string, ChannelRollup>();

  for (const p of PLAYLISTS) {
    const data = getPlaylist(p.id);
    if (!data) continue;

    for (const item of data.items) {
      // Private and deleted videos carry no owner at all — nothing to credit.
      if (!item.channelTitle) continue;

      const key = item.channelId ?? `title:${item.channelTitle}`;
      const existing = byKey.get(key);

      if (existing) {
        existing.videoCount++;
        if (!existing.playlists.includes(p.label)) existing.playlists.push(p.label);
      } else {
        byKey.set(key, {
          channelId: item.channelId,
          title: item.channelTitle,
          videoCount: 1,
          playlists: [p.label],
        });
      }
    }
  }

  return byKey;
}

/** Channels at or above MIN_VIDEOS, most-watched first, ties broken by name. */
export function getTopChannels(min: number = MIN_VIDEOS): ChannelRollup[] {
  return [...collect().values()]
    .filter((c) => c.videoCount >= min)
    .sort((a, b) => b.videoCount - a.videoCount || a.title.localeCompare(b.title));
}

/** Totals for the page's standfirst — computed over every channel, not just the shown ones. */
export function getChannelStats() {
  const all = [...collect().values()];
  const shown = all.filter((c) => c.videoCount >= MIN_VIDEOS);
  return {
    totalChannels: all.length,
    shownChannels: shown.length,
    shownVideos: shown.reduce((n, c) => n + c.videoCount, 0),
    totalVideos: all.reduce((n, c) => n + c.videoCount, 0),
  };
}

/** Channel page URL, or a search fallback when the cache predates channelId. */
export function channelUrl(c: ChannelRollup): string {
  return c.channelId
    ? `https://www.youtube.com/channel/${c.channelId}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(c.title)}`;
}
