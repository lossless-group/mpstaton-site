/**
 * Pure types and helpers for the YouTube playlist component family.
 * No Node imports — safe to import from client-side bundles (Svelte islands).
 */

export interface PlaylistItem {
  videoId: string;
  position: number;       // YouTube's playlist-position index — used for playVideoAt()
  title: string;
  thumbnail: string;
  duration?: string;      // ISO 8601 — PT4M30S
  addedAt?: string;       // ISO timestamp; when the video was added to the playlist
  channelTitle?: string;
  unavailable?: boolean;
}

export interface PlaylistCacheEntry {
  id: string;
  title: string;
  description?: string;
  channelTitle: string;
  channelId: string;
  itemCount: number;
  thumbnail: string;
  fetchedAt: string;
  items: PlaylistItem[];
  unavailable?: boolean;
}

/** Format ISO 8601 duration (PT4M30S) → "4:30" / "1:23:45". */
export function formatDuration(iso: string | undefined): string {
  if (!iso) return '';
  const m = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return '';
  const h = parseInt(m[1] ?? '0', 10);
  const min = parseInt(m[2] ?? '0', 10);
  const s = parseInt(m[3] ?? '0', 10);
  if (h > 0) return `${h}:${String(min).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${min}:${String(s).padStart(2, '0')}`;
}
