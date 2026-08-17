import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Loader for the markup figures split out of the public track-record JSON.
 *
 * Two sources, in priority order:
 *   1. TRACK_RECORD_MARKUPS_JSON — the whole payload as an env var. This is
 *      how production reads it, because the file below is gitignored and so
 *      never reaches the Vercel builder.
 *   2. src/data/track-record/private/markups.json — the local dev copy.
 *
 * Returns empty maps when neither is available, which is a legitimate state:
 * a fork or a fresh clone builds and renders a public-only table rather than
 * failing. Callers must treat an absent markup as "not disclosed", never as
 * an error, and never as zero.
 */

export type DealMarkup = { multiple?: string; relevantValuation?: number | null };
export type FundMarkup = { multiple?: string };

export type Markups = {
  deals: Record<string, DealMarkup>;
  funds: Record<string, FundMarkup>;
};

const EMPTY: Markups = { deals: {}, funds: {} };

let cache: Markups | null = null;

function readEnv(key: string): string | undefined {
  const fromProcess = typeof process !== 'undefined' ? process.env?.[key] : undefined;
  if (fromProcess != null && fromProcess !== '') return fromProcess;
  const fromMeta = (import.meta.env as Record<string, string | undefined>)[key];
  return fromMeta != null && fromMeta !== '' ? fromMeta : undefined;
}

function normalize(raw: unknown): Markups {
  if (!raw || typeof raw !== 'object') return EMPTY;
  const obj = raw as Partial<Markups>;
  return {
    deals: obj.deals && typeof obj.deals === 'object' ? obj.deals : {},
    funds: obj.funds && typeof obj.funds === 'object' ? obj.funds : {},
  };
}

export function loadMarkups(): Markups {
  if (cache) return cache;

  const fromEnv = readEnv('TRACK_RECORD_MARKUPS_JSON');
  if (fromEnv) {
    try {
      cache = normalize(JSON.parse(fromEnv));
      return cache;
    } catch {
      console.warn('[track-record] TRACK_RECORD_MARKUPS_JSON is not valid JSON — ignoring it.');
    }
  }

  try {
    const path = fileURLToPath(new URL('../../data/track-record/private/markups.json', import.meta.url));
    cache = normalize(JSON.parse(readFileSync(path, 'utf-8')));
    return cache;
  } catch {
    // Absent by design in any environment without the private data.
  }

  cache = EMPTY;
  return cache;
}

/** True when markup data exists at all — distinguishes "locked" from "we have nothing". */
export function hasMarkups(): boolean {
  const m = loadMarkups();
  return Object.keys(m.deals).length > 0 || Object.keys(m.funds).length > 0;
}
