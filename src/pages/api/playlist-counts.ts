/**
 * /api/playlist-counts — the runtime counter's status and current values.
 *
 * Two jobs. It answers "is the live refresh actually working, and how old is
 * the number" without reading logs. And hitting it warms a cold instance's
 * memo, so it doubles as the endpoint an external scheduler can ping if you
 * ever want the refresh on a real clock rather than on traffic.
 *
 * Read-only: it cannot force a fetch beyond the module's own TTL logic, so it
 * is safe to call as often as you like.
 */
import type { APIRoute } from 'astro';
import { PLAYLISTS } from '../../config/playlists';
import { getPlaylist } from '../../lib/youtube-playlist-cache';
import { getLiveCounts, liveCountsMeta } from '../../lib/youtube-playlist-live';

export const prerender = false;

export const GET: APIRoute = async () => {
  const ids = PLAYLISTS.map((p) => p.id);
  const live = getLiveCounts(ids);

  const playlists = PLAYLISTS.map((p) => {
    const cached = getPlaylist(p.id);
    const fresh = live?.get(p.id);
    return {
      id: p.id,
      label: p.label,
      buildCount: cached?.itemCount ?? 0,
      liveCount: fresh?.itemCount ?? null,
      drift: fresh && cached ? fresh.itemCount - cached.itemCount : null,
      source: fresh ? 'live' : 'build-cache',
    };
  });

  return new Response(
    JSON.stringify({ ...liveCountsMeta(), total: playlists.reduce((n, p) => n + (p.liveCount ?? p.buildCount), 0), playlists }, null, 2),
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        // Never let a CDN pin a counter reading.
        'Cache-Control': 'private, no-store',
      },
    }
  );
};
