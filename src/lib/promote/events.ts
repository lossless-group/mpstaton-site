/**
 * Event plans — conference and trip briefs that ride alongside a proposal.
 *
 * Each lives at `content/proposals/{slug}/events/{event}/plan.md`: frontmatter
 * for the card, LFM markdown for the body. They sit under the proposal's URL
 * (`/proposals/{slug}/events/{event}`), so the existing middleware gate covers
 * them and the proposal's passcode unlocks them. No second gate to maintain.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { parseMarkdown } from '@lossless-group/lfm';
import { opportunityDir } from './opportunities';
import { ogFetchOptions } from './og-fetch';

export interface EventMeta {
  slug: string;
  title: string;
  event?: string;
  dates?: string;
  venue?: string;
  summary?: string;
}

export interface ParsedEvent {
  meta: EventMeta;
  tree: any;
  citations: any[];
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

function eventsDir(slug: string): string {
  return join(opportunityDir(slug), 'events');
}

function readPlan(slug: string, event: string): { meta: EventMeta; body: string } | null {
  const path = join(eventsDir(slug), event, 'plan.md');
  if (!existsSync(path)) return null;
  const source = readFileSync(path, 'utf-8');
  const match = source.match(FRONTMATTER);
  const fm = (match ? parseYaml(match[1]) : {}) as Record<string, unknown>;
  const body = match ? source.slice(match[0].length) : source;
  const meta: EventMeta = {
    slug: event,
    title: String(fm.title ?? event),
    event: fm.event as string | undefined,
    dates: fm.dates as string | undefined,
    venue: fm.venue as string | undefined,
    summary: fm.summary as string | undefined,
  };
  return { meta, body };
}

export function listEvents(slug: string): EventMeta[] {
  const dir = eventsDir(slug);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((entry) => statSync(join(dir, entry)).isDirectory())
    .map((entry) => readPlan(slug, entry)?.meta)
    .filter((m): m is EventMeta => !!m)
    .sort((a, b) => (a.dates ?? '').localeCompare(b.dates ?? ''));
}

export async function loadEvent(slug: string, event: string): Promise<ParsedEvent | null> {
  const plan = readPlan(slug, event);
  if (!plan) return null;
  let tree: any;
  try {
    tree = await parseMarkdown(plan.body, { ogFetch: ogFetchOptions() }) as any;
  } catch (err) {
    console.warn(`[events] OG enrichment failed for ${slug}/${event}; rendering without previews.`, err);
    tree = await parseMarkdown(plan.body) as any;
  }
  return { meta: plan.meta, tree, citations: tree.data?.citations?.ordered ?? [] };
}

export function eventUrl(slug: string, event: string): string {
  return `/proposals/${slug}/events/${event}`;
}
