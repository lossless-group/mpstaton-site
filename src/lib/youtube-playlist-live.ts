/**
 * youtube-playlist-live — refresh playlist counts at RUNTIME, no rebuild.
 *
 * The build-time cache (youtube-playlist-cache.json) is correct the moment a
 * deploy happens and drifts from then on. This site is `output: 'server'` on
 * Vercel, so pages render per request — which means the counter can be kept
 * current without a rebuild, a commit, or any storage service.
 *
 * WHY NOT A CRON JOB: a Vercel cron would fire an API route on a serverless
 * instance whose filesystem is read-only and thrown away after the invocation,
 * so it has nowhere to write the refreshed number. Making cron work means
 * adding a KV/Blob store — real infrastructure for one integer. This gets the
 * same "checks daily, never rebuilds, never commits" outcome with no new
 * services, by refreshing in the request path instead of on a timer.
 *
 * COST: `playlists.list` takes comma-separated ids and costs 1 quota unit for
 * the whole set, however many videos they contain (a full item fetch is ~241).
 * One unit per instance per TTL window is negligible against 10,000/day.
 *
 * STALE-WHILE-REVALIDATE: reads never await the network. A stale value is
 * returned immediately and a refresh is kicked off in the background, so a
 * slow or failing YouTube API can delay the *next* correct number but can
 * never delay or break a page render.
 *
 * Requires YOUTUBE_API_KEY in the RUNTIME environment (Vercel project env),
 * not just the build environment. Without it this module is inert and callers
 * fall back to the build-time cache.
 */

const API_BASE = 'https://www.googleapis.com/youtube/v3';

/**
 * Read from both env surfaces. Astro loads `.env` into `import.meta.env` and
 * does NOT copy unprefixed keys into `process.env`, so a process.env-only read
 * silently reports "no key" in dev; Vercel injects project env vars into
 * `process.env` at runtime, so an import.meta-only read fails in production.
 * Checking both is what makes this work in dev and on the deployed site.
 */
function env(name: string): string | undefined {
  return (import.meta.env as Record<string, any>)?.[name] ?? process.env[name];
}

/** How long a fetched value is considered current. "Daily" by default. */
const TTL_MS = Number(env('YOUTUBE_LIVE_TTL_MS') ?? 24 * 60 * 60 * 1000);

export interface LiveCount {
  title: string;
  itemCount: number;
}

/** Module-level, so it survives across requests on a warm serverless instance. */
let memo: Map<string, LiveCount> | null = null;
let memoAt = 0;
let inFlight: Promise<void> | null = null;

function isStale(): boolean {
  return memo === null || Date.now() - memoAt > TTL_MS;
}

async function refresh(ids: string[], key: string): Promise<void> {
  const url = `${API_BASE}/playlists?id=${ids.join(',')}&part=snippet,contentDetails&key=${key}`;
  // A hung request must not pin the in-flight lock forever.
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`playlists.list ${res.status}`);
    const json = (await res.json()) as {
      items?: Array<{
        id: string;
        snippet: { title: string };
        contentDetails: { itemCount: number };
      }>;
    };
    const next = new Map<string, LiveCount>();
    for (const p of json.items ?? []) {
      next.set(p.id, { title: p.snippet.title, itemCount: p.contentDetails.itemCount });
    }
    // Only publish a non-empty result — an empty response should leave the
    // previous good value (or the build cache) in place rather than zero the
    // page's counters.
    if (next.size) {
      memo = next;
      memoAt = Date.now();
    }
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Current live counts, or null if none have been fetched yet.
 *
 * Never throws and never awaits the network. Callers must treat null — and a
 * missing id — as "use the build-time cache value".
 */
export function getLiveCounts(ids: string[]): Map<string, LiveCount> | null {
  const key = env('YOUTUBE_API_KEY');
  if (!key || !ids.length) return memo;

  if (isStale() && !inFlight) {
    inFlight = refresh(ids, key)
      .catch(() => {
        // Swallowed on purpose: a counter is not worth a 500, and the caller
        // already has a build-time number to fall back to.
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return memo;
}

/** Diagnostics for the /api/playlist-counts route. */
export function liveCountsMeta() {
  return {
    hasKey: Boolean(env('YOUTUBE_API_KEY')),
    ttlMs: TTL_MS,
    fetchedAt: memoAt ? new Date(memoAt).toISOString() : null,
    ageMs: memoAt ? Date.now() - memoAt : null,
    stale: isStale(),
    ids: memo ? [...memo.keys()] : [],
  };
}
