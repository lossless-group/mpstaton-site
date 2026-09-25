/**
 * Shared LFM Open Graph fetch configuration for the gated surfaces.
 *
 * Both `/promote/*` and `/proposals/*` render on demand, which puts the OG
 * enrichment stage inside the request rather than inside the build. That breaks
 * two assumptions the stage was written under:
 *
 *   1. A cache miss is cheap. In a build it is; in a request it is a live HTTP
 *      fetch per external link, and a long proposal has well over a hundred.
 *   2. The cache file is writable. On a serverless host the bundle is read-only,
 *      so `dispatcher.flush()` throws EROFS as soon as anything goes dirty.
 *
 * So `src/data/og-cache.json` is tracked in git and shipped with the function
 * (see `listContentFiles()` in astro.config.mjs). When it covers every URL in
 * the document the dispatcher short-circuits on every lookup — hits and cached
 * failures alike — no request touches the network, and `flush()` is a no-op.
 * Everything below is the safety net for the case where it does not.
 */
import { copyFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Vercel sets this in both the build and the function runtime.
export const IS_SERVERLESS = Boolean(process.env.VERCEL);

/**
 * The cache location, as an ABSOLUTE path.
 *
 * `cachePath` resolves against the process cwd, which is not the same directory
 * in a dev server, a local build, and a Vercel function root — a relative path
 * meant a render could read one file and write another.
 *
 * On serverless, reads come from the bundled copy and writes go to a `/tmp`
 * clone, that being the one writable location a function gets.
 */
export function resolveOgCachePath(): string {
  const bundled = join(process.cwd(), 'src/data/og-cache.json');
  if (!IS_SERVERLESS) return bundled;

  const writable = join(tmpdir(), 'lfm-og-cache.json');
  if (!existsSync(writable) && existsSync(bundled)) {
    try {
      copyFileSync(bundled, writable);
    } catch {
      // A failed seed costs cache hits, not the render — the dispatcher treats
      // a missing cache as an empty one.
    }
  }
  return existsSync(writable) ? writable : bundled;
}

/**
 * Options for `parseMarkdown({ ogFetch })` on a request-rendered route.
 *
 * A miss stays survivable but has to fail fast: on serverless one retry pass at
 * the default five-second timeout, repeated across a document's links, will
 * spend the function's entire budget before the page exists.
 */
export function ogFetchOptions() {
  const apiKey = import.meta.env.OPENGRAPH_IO_API_KEY;
  const cachePath = resolveOgCachePath();
  // If the cache did not travel with the function, every link in the document
  // is a miss, and the fastest correct answer is to skip enrichment entirely:
  // there are no previews to recover either way, and attempting them would
  // spend the request on fetches that cannot be saved anywhere.
  const enabled = !IS_SERVERLESS || existsSync(cachePath);
  return {
    enabled,
    backend: (apiKey ? 'opengraph-io' : 'direct') as 'opengraph-io' | 'direct',
    apiKey,
    cachePath,
    maxConcurrent: 4,
    timeout: IS_SERVERLESS ? 1500 : 5000,
    retries: IS_SERVERLESS ? 0 : 3,
    // A year, so the tracked cache never lapses back into request-time fetching.
    ttl: 365 * 24 * 60 * 60,
    failCacheTtl: 30 * 24 * 60 * 60,
    rateLimit: { perMinute: 60, perMonth: 100 },
  };
}
