/**
 * youtube-channels — the site-facing channel view: the cache rolled up by
 * channel, ranked, and overlaid with the hand-picked favorites.
 *
 * Derived at build time from the same cache /playlists renders from, so this
 * surface has no fetch of its own and no ranking to hand-maintain: adding
 * videos to a playlist moves a channel up the page on the next deploy. What
 * IS hand-maintained is which channels are favorites — a judgement the counts
 * cannot make — and that lives in src/config/channel-favorites.json, seeded by
 * `pnpm seed-channels` and edited by a human.
 *
 * Server-only, like the cache it reads. The ranking itself lives in
 * ./youtube-channels-rollup so scripts/ can share it under Bun.
 */

import { PLAYLISTS } from '../config/playlists';
import { getPlaylist } from './youtube-playlist-cache';
import { rollupChannels, rankChannels, MIN_VIDEOS } from './youtube-channels-rollup';
import type { ChannelRollup } from './youtube-channels-rollup';
import favorites from '../config/channel-favorites.json';

export { channelUrl, MIN_VIDEOS } from './youtube-channels-rollup';
export type { ChannelRollup } from './youtube-channels-rollup';

interface FavoriteEntry {
  title: string;
  favorite: boolean;
  note?: string;
}

const overlay = favorites as Record<string, FavoriteEntry>;

export interface Channel extends ChannelRollup {
  isFavorite: boolean;
  note?: string;
}

function collect() {
  return rollupChannels(PLAYLISTS.map((p) => ({ label: p.label, entry: getPlaylist(p.id) })));
}

function decorate(c: ChannelRollup): Channel {
  const pick = c.channelId ? overlay[c.channelId] : undefined;
  return { ...c, isFavorite: pick?.favorite === true, note: pick?.note || undefined };
}

/** Channels at or above the threshold, most-kept first. */
export function getTopChannels(min: number = MIN_VIDEOS): Channel[] {
  return rankChannels(collect(), min).map(decorate);
}

/**
 * The hand-picked ones, in the same volume order.
 *
 * Ranked across EVERY channel rather than the shown ones, so a favorite that
 * sits below the display threshold still surfaces — the whole point of picking
 * by hand is to say something the counts do not.
 */
export function getFavoriteChannels(): Channel[] {
  return rankChannels(collect(), 1).map(decorate).filter((c) => c.isFavorite);
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
    favoriteCount: getFavoriteChannels().length,
  };
}
