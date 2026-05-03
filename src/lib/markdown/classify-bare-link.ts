/**
 * Bare-link classifier for the LFM auto-unfurl flow.
 *
 * Mirrors the catalog at packages/lfm/src/plugins/Bare-Link-Provider-Catalog.md.
 * When the LFM bare-link plugin lands, this site-local helper goes away and
 * classification happens in the parser. Until then: render-time dispatch.
 */

export type BareLinkComponent =
  | 'YouTubeEmbed'
  | 'YouTubeShortsEmbed'
  | 'YouTubePlaylistEmbed';

export type BareLinkKind = 'video' | 'short' | 'playlist';

export interface BareLinkClassification {
  provider: string;
  component: BareLinkComponent;
  kind: BareLinkKind;
  id: string;
  url: string;
}

interface Matcher {
  provider: string;
  component: BareLinkComponent;
  kind: BareLinkKind;
  match: (u: URL) => string | null;
}

const YT_HOSTS_FULL = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com']);
const YT_HOSTS_PLAYLIST = new Set(['youtube.com', 'www.youtube.com']);

const matchers: Matcher[] = [
  {
    provider: 'youtube-short',
    component: 'YouTubeShortsEmbed',
    kind: 'short',
    match: (u) => {
      if (!YT_HOSTS_FULL.has(u.hostname.toLowerCase())) return null;
      const m = u.pathname.match(/^\/shorts\/([A-Za-z0-9_-]+)\/?$/);
      return m ? m[1] : null;
    },
  },
  {
    provider: 'youtube-playlist',
    component: 'YouTubePlaylistEmbed',
    kind: 'playlist',
    match: (u) => {
      if (!YT_HOSTS_PLAYLIST.has(u.hostname.toLowerCase())) return null;
      if (u.pathname !== '/playlist' && u.pathname !== '/playlist/') return null;
      const id = u.searchParams.get('list');
      return id && /^[A-Za-z0-9_-]+$/.test(id) ? id : null;
    },
  },
  {
    provider: 'youtube-video',
    component: 'YouTubeEmbed',
    kind: 'video',
    match: (u) => {
      const host = u.hostname.toLowerCase();
      if (host === 'youtu.be') {
        const m = u.pathname.match(/^\/([A-Za-z0-9_-]{11})\/?$/);
        return m ? m[1] : null;
      }
      if (YT_HOSTS_FULL.has(host)) {
        if (u.pathname !== '/watch' && u.pathname !== '/watch/') return null;
        const v = u.searchParams.get('v');
        return v && /^[A-Za-z0-9_-]{11}$/.test(v) ? v : null;
      }
      return null;
    },
  },
];

export function classifyBareLink(rawUrl: string): BareLinkClassification | null {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return null;
  }
  for (const m of matchers) {
    const id = m.match(parsed);
    if (id) {
      return {
        provider: m.provider,
        component: m.component,
        kind: m.kind,
        id,
        url: rawUrl,
      };
    }
  }
  return null;
}

/**
 * Detects whether an MDAST paragraph node is a "bare URL" — exactly one child,
 * a `link` node whose visible text equals its URL (the autolink shape).
 * Returns the URL, or null if the paragraph is anything else.
 */
export function getBareLinkUrl(node: unknown): string | null {
  const para = node as { type?: string; children?: unknown[] };
  if (!para || para.type !== 'paragraph') return null;
  const children = Array.isArray(para.children) ? para.children : [];
  if (children.length !== 1) return null;
  const child = children[0] as { type?: string; url?: string; children?: unknown[] };
  if (!child || child.type !== 'link') return null;
  const linkText = (child.children ?? [])
    .map((c) => {
      const v = (c as { value?: unknown }).value;
      return typeof v === 'string' ? v : '';
    })
    .join('')
    .trim();
  const href = (child.url ?? '').trim();
  return linkText === href && href.length > 0 ? href : null;
}
