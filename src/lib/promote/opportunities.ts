import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import type { Opportunity, VariantsRegistry } from './types';

// Two roots, one record shape. `promote/` is the investment-promotion surface
// (decks, memos) that sits beside /hype-machine. `proposals/` is client work,
// which has no business on that path — see src/pages/proposals/.
const CONTENT_ROOTS = [
  new URL('../../content/proposals/', import.meta.url),
  new URL('../../content/promote/', import.meta.url),
];
const CONTENT_ROOT = CONTENT_ROOTS[1];

function contentPath(...parts: string[]): string {
  for (const rootUrl of CONTENT_ROOTS) {
    const candidate = join(new URL(rootUrl).pathname, ...parts);
    if (existsSync(candidate)) return candidate;
  }
  return join(new URL(CONTENT_ROOTS[0]).pathname, ...parts);
}

function readYaml<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  return parseYaml(readFileSync(path, 'utf-8')) as T;
}

let cache: Map<string, Opportunity> | null = null;

function load(): Map<string, Opportunity> {
  // Bypass in dev so edits to opportunity.yaml / variants.yaml surface on the
  // next request. Production keeps the cache (the build runs the loader once).
  if (cache && !import.meta.env.DEV) return cache;
  cache = new Map();

  for (const rootUrl of CONTENT_ROOTS) {
  const root = new URL(rootUrl).pathname;
  if (!existsSync(root)) continue;

  for (const entry of readdirSync(root)) {
    const dir = join(root, entry);
    if (!statSync(dir).isDirectory()) continue;
    const oppPath = join(dir, 'opportunity.yaml');
    if (!existsSync(oppPath)) continue;

    const raw = readYaml<Partial<Opportunity>>(oppPath);
    if (!raw) continue;

    const opportunity: Opportunity = {
      slug: entry,
      codename: raw.codename ?? entry,
      company_name: raw.company_name ?? raw.codename ?? entry,
      status: (raw.status as Opportunity['status']) ?? 'active',
      listed_in_index: raw.listed_in_index !== false,
      short_description: raw.short_description,
      eyebrow: raw.eyebrow,
      logo: raw.logo,
      accent_color: raw.accent_color,
      og_image: raw.og_image,
      materials: raw.materials ?? [],
      gate: raw.gate,
    };

    cache.set(entry, opportunity);
  }
  }
  return cache;
}

export function getAllOpportunities(): Opportunity[] {
  return Array.from(load().values());
}

export function getListedOpportunities(): Opportunity[] {
  return getAllOpportunities()
    .filter(o => o.listed_in_index)
    .sort((a, b) => {
      const order = { 'closing-soon': 0, active: 1, paused: 2, closed: 3 };
      return order[a.status] - order[b.status];
    });
}

export function getOpportunity(slug: string): Opportunity | null {
  return load().get(slug) ?? null;
}

export function getVariantsRegistry(slug: string): VariantsRegistry {
  const path = contentPath(slug, 'variants.yaml');
  return readYaml<VariantsRegistry>(path) ?? {};
}

export function opportunityDir(slug: string): string {
  return contentPath(slug);
}

/** True when the slug lives under content/proposals rather than content/promote. */
export function isProposalContent(slug: string): boolean {
  return existsSync(join(new URL(CONTENT_ROOTS[0]).pathname, slug));
}
