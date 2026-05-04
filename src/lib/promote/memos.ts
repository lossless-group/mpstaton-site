import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseMarkdown } from '@lossless-group/lfm';
import { opportunityDir } from './opportunities';

export interface ParsedMemo {
  tree: any;
  citations: any[];
}

export async function loadMemo(slug: string, version: number): Promise<ParsedMemo | null> {
  const dir = opportunityDir(slug);
  const candidates = [
    join(dir, 'memo', `v${version}.md`),
    join(dir, 'memo', `version-${version}.md`),
    version === 1 ? join(dir, 'memo.md') : null,
  ].filter(Boolean) as string[];

  const found = candidates.find(p => existsSync(p));
  if (!found) return null;

  const source = readFileSync(found, 'utf-8');
  const apiKey = import.meta.env.OPENGRAPH_IO_API_KEY;
  const tree = await parseMarkdown(source, {
    ogFetch: {
      enabled: true,
      backend: apiKey ? 'opengraph-io' : 'direct',
      apiKey,
      cachePath: 'src/data/og-cache.json',
      maxConcurrent: 4,
      rateLimit: { perMinute: 60, perMonth: 100 },
    },
  }) as any;
  const citations = tree.data?.citations?.ordered ?? [];
  return { tree, citations };
}
