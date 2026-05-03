import type { DeckFormat } from './types';

type SectionGlob = Record<string, () => Promise<{ default: any }>>;

const sectionModules = import.meta.glob('../../layouts/sections/promote/**/*.astro') as SectionGlob;

export interface ResolvedSection {
  path: string;
  filename: string;
  Component: any;
}

export async function loadSections(
  slug: string,
  format: DeckFormat,
  version: number,
): Promise<ResolvedSection[]> {
  const prefix = `../../layouts/sections/promote/${slug}/deck/${format}/v${version}/`;
  const matches = Object.entries(sectionModules)
    .filter(([path]) => path.startsWith(prefix))
    .sort(([a], [b]) => a.localeCompare(b));

  const sections: ResolvedSection[] = [];
  for (const [path, loader] of matches) {
    const mod = await loader();
    const filename = path.split('/').pop() ?? path;
    sections.push({ path, filename, Component: mod.default });
  }
  return sections;
}
