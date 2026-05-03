import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import type { Opportunity, VariantsRegistry } from './types';

const CONTENT_ROOT = new URL('../../content/promote/', import.meta.url);

function contentPath(...parts: string[]): string {
  return join(new URL(CONTENT_ROOT).pathname, ...parts);
}

function readYaml<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  return parseYaml(readFileSync(path, 'utf-8')) as T;
}

let cache: Map<string, Opportunity> | null = null;

function load(): Map<string, Opportunity> {
  if (cache) return cache;
  cache = new Map();

  const root = new URL(CONTENT_ROOT).pathname;
  if (!existsSync(root)) return cache;

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
