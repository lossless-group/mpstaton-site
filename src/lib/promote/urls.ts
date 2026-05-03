import type { Material, Opportunity } from './types';

export function hubUrl(slug: string): string {
  return `/promote/${slug}`;
}

export function materialUrl(slug: string, m: Material): string {
  if (m.type === 'deck') {
    if (!m.format) throw new Error(`Deck material on '${slug}' missing required format`);
    return `/promote/${slug}/deck/${m.format}`;
  }
  if (m.type === 'memo') return `/promote/${slug}/memo`;
  return `/promote/${slug}/${m.type}`;
}

export function deckVersionUrl(slug: string, format: string, version: number): string {
  return `/promote/${slug}/deck/${format}/version-${version}`;
}

export function memoVersionUrl(slug: string, version: number): string {
  return `/promote/${slug}/memo/version-${version}`;
}

export function visibleMaterials(opp: Opportunity, isDev: boolean): Material[] {
  return opp.materials.filter(m => isDev || m.status !== 'draft');
}

export function parseVersionParam(raw: string | undefined): number | null {
  if (!raw) return null;
  const match = raw.match(/^version-(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}
