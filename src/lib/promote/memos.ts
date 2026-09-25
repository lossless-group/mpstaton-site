import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseMarkdown } from '@lossless-group/lfm';
import { opportunityDir } from './opportunities';
import { ogFetchOptions } from './og-fetch';

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
  let tree: any;
  try {
    tree = await parseMarkdown(source, { ogFetch: ogFetchOptions() }) as any;
  } catch (err) {
    // Link previews are an enhancement; the memo is the deliverable.
    console.warn(`[memos] OG enrichment failed for ${found}; rendering without previews.`, err);
    tree = await parseMarkdown(source) as any;
  }
  const citations = tree.data?.citations?.ordered ?? [];
  return { tree, citations };
}
