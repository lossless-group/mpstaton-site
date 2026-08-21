import { createOGDispatcher } from '@lossless-group/lfm';
import type { InvestmentOg } from './types';

/**
 * Build-time OpenGraph fetch for company websites.
 *
 * The memos have no OG data of their own — they are documents about companies,
 * not the companies' own pages. So the card's imagery and one-line description
 * come from fetching each `company_url` and reading its meta tags.
 *
 * This reuses LFM's `OGDispatcher` rather than hand-rolling a fetch, which
 * buys the four things that make a build-time network call safe: an on-disk
 * cache (so the second build makes zero requests), retries with backoff, a
 * concurrency cap, and a rate limiter. It also shares `src/data/og-cache.json`
 * with the link-preview fetch in src/lib/promote/memos.ts — one cache file per
 * site, as the LFM spec intends, so a URL fetched by either path is warm for
 * both.
 *
 * ONE DISPATCHER PER BUILD, not per page. Astro evaluates each page module
 * independently, so a naive `createOGDispatcher()` inside a page's frontmatter
 * would build a fresh dispatcher — and a fresh in-memory cache — for every
 * route. Four routes over two companies would then be four separate flushes
 * racing to write the same JSON file. The module-level promise below is
 * resolved once and awaited by everyone.
 */

const CACHE_PATH = 'src/data/og-cache.json';

/**
 * `direct` fetches the page and parses its own meta tags — no credential, no
 * quota. `opengraph-io` renders JS and gets past some bot walls, which matters
 * for company marketing sites built as SPAs. Use the paid backend when the key
 * is present, degrade to direct when it isn't, exactly as loadMemo does.
 */
function dispatcherOptions() {
  const apiKey = import.meta.env.OPENGRAPH_IO_API_KEY;
  return {
    enabled: true,
    backend: (apiKey ? 'opengraph-io' : 'direct') as 'opengraph-io' | 'direct',
    apiKey,
    cachePath: CACHE_PATH,
    maxConcurrent: 4,
    // Company sites are slower than article pages and some sit behind a CDN
    // challenge. 8s rather than the 5s default so a slow-but-fine site isn't
    // recorded as a failure for the next day of builds.
    timeout: 8000,
    rateLimit: { perMinute: 60, perMonth: 100 },
  };
}

let pending: Promise<Map<string, InvestmentOg>> | null = null;

/**
 * Fetch OG data for every company URL in one pass, then flush the cache once.
 *
 * Returns a map keyed by the URL as authored. Callers look up their own URL;
 * a URL that failed is present in the map with `status: 'failed'` rather than
 * absent, so the caller never has to distinguish "not fetched" from "fetched
 * and empty".
 */
export function fetchCompanyOg(urls: string[]): Promise<Map<string, InvestmentOg>> {
  if (pending) return pending;

  pending = (async () => {
    const results = new Map<string, InvestmentOg>();
    const unique = [...new Set(urls.filter(Boolean))];
    if (unique.length === 0) return results;

    let dispatcher;
    try {
      dispatcher = await createOGDispatcher(dispatcherOptions());
    } catch (err) {
      // A dispatcher that cannot even be constructed (unreadable cache file,
      // bad options) must not take the build down with it. Every company
      // degrades to its frontmatter, which is always enough to render.
      console.warn('[investments/og] dispatcher unavailable, falling back to frontmatter:', err);
      for (const url of unique) results.set(url, { status: 'failed' });
      return results;
    }

    await Promise.all(
      unique.map(async (url) => {
        try {
          const { data, fromCache } = await dispatcher.fetch(url);
          results.set(url, {
            title: data.title,
            description: data.description,
            image: data.image,
            source: data.source,
            sourceUrl: data.sourceUrl,
            status:
              data.cacheStatus === 'failed' ? 'failed' : fromCache ? 'hit' : 'miss',
          });
        } catch (err) {
          console.warn(`[investments/og] fetch failed for ${url}:`, err);
          results.set(url, { status: 'failed' });
        }
      })
    );

    try {
      await dispatcher.flush();
    } catch (err) {
      // A cache that didn't persist costs the next build some requests. It is
      // not a reason to fail this one.
      console.warn('[investments/og] cache flush failed:', err);
    }

    return results;
  })();

  return pending;
}
