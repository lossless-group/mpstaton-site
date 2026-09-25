import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import type { Opportunity, VariantsRegistry } from './types';

// Two roots, one record shape. `promote/` is the investment-promotion surface
// (decks, memos) that sits beside /hype-machine. `proposals/` is client work,
// which has no business on that path — see src/pages/proposals/.
/**
 * Content roots, resolved against the filesystem rather than this module's URL.
 *
 * `import.meta.url` works in dev but not on Vercel: the adapter bundles the
 * server into `_render.func/dist/server/` while `includeFiles` copies content
 * to `_render.func/src/content/`, so a relative `../../content` walks into a
 * directory that does not exist. The symptom is silent — every lookup returns
 * null, the index renders empty and each slug 404s, with nothing in the logs.
 *
 * So: try each candidate and keep the ones that are actually there.
 */
const CONTENT_SECTIONS = ['proposals', 'promote'] as const;

function resolveRoots(section: string): string[] {
  const candidates = [
    // Vercel: function root, where includeFiles puts them.
    join(process.cwd(), 'src/content', section),
    // Dev and `astro preview`: relative to this module.
    join(new URL(`../../content/${section}/`, import.meta.url).pathname),
  ];
  return candidates.filter((c) => existsSync(c));
}

const CONTENT_ROOTS: string[] = CONTENT_SECTIONS.flatMap(resolveRoots);
const PROPOSAL_ROOTS: string[] = resolveRoots('proposals');

/** First existing path for `parts` across the content roots. */
function contentPath(...parts: string[]): string {
  for (const root of CONTENT_ROOTS) {
    const candidate = join(root, ...parts);
    if (existsSync(candidate)) return candidate;
  }
  return join(CONTENT_ROOTS[0] ?? '', ...parts);
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

  for (const root of CONTENT_ROOTS) {
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
  return PROPOSAL_ROOTS.some((root) => existsSync(join(root, slug)));
}
