/**
 * playlists.ts — the curated set of YouTube playlists surfaced at /playlists.
 *
 * This is a *registry*, not a discovery mechanism. The build-time fetcher
 * (scripts/fetch-youtube-playlists.ts) scrapes playlist URLs out of
 * src/content/ markdown, which is the right behaviour for a playlist an author
 * pasted into a document — but a curated page needs an explicit, ordered,
 * human-labelled set that no markdown file happens to mention. The fetcher
 * reads this file too, so adding an entry here is enough to get it cached.
 *
 * `label` is the toggle text and must stay short — it sits in a pill row.
 * `title` and item counts come from the cache at render time, never from here,
 * so this file cannot drift from what YouTube actually reports.
 */

export interface CuratedPlaylist {
  /** YouTube playlist ID — the `list=` parameter. */
  id: string;
  /** Short toggle label. Keep to one or two words. */
  label: string;
  /** One line under the toggles explaining what this playlist collects. */
  blurb: string;
}

export const PLAYLISTS: CuratedPlaylist[] = [
  {
    id: 'PLME9DvdybGUN7PtbmJhSyYcUakt7tAya1',
    label: 'Lossless Toolkit',
    blurb:
      'The running collection — tools, talks, and explainers worth keeping. The one the playlist components were built against.',
  },
  {
    id: 'PLME9DvdybGUMV2LRDVAtYZEzekBuDezzu',
    label: 'Lossless Thinking',
    blurb:
      'How people reason about building software — architecture arguments, engineering philosophy, and the disagreements worth having.',
  },
  {
    id: 'PLME9DvdybGUOUD5gwRomPyH-_ybj-SlrB',
    label: 'Tech Adjacent Possible',
    blurb:
      'The edges: hardware, energy, materials, space, and the engineering stories that sit just outside the software world.',
  },
  {
    id: 'PLME9DvdybGUPPMAvXfZTro58NIsZq1p_2',
    label: 'Music Videos',
    blurb: 'Last, and not pretending to be work. This is a personal site.',
  },
];
