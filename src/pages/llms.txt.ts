/**
 * /llms.txt — link index for LLM consumers.
 *
 * Spec: https://llmstxt.org/
 *
 * The human-editable prose template lives at `src/llms/llms.md` (with token
 * documentation in `src/llms/README.md`). This file is the dumb assembler:
 * load template, compute dynamic values, substitute tokens. Edit prose in
 * the markdown — not here.
 *
 * This site is `output: 'server'` (Vercel). `prerender = true` makes Astro
 * emit a static dist/llms.txt at build time so we never assemble multi-KB
 * markdown on a request hot path.
 */

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_SEO } from '../config/seo';
import template from '../llms/llms.md?raw';

export const prerender = true;

type AnyData = Record<string, any>;

function isPublished(data: AnyData): boolean {
  return data.publish !== false && data.private !== true;
}

function entryDateMs(data: AnyData): number {
  const d =
    data.date_modified ??
    data.date_authored_current_draft ??
    data.date_created ??
    data.date_authored_initial_draft ??
    data.date;
  if (!d) return 0;
  const t = d instanceof Date ? d.getTime() : new Date(d).getTime();
  return Number.isNaN(t) ? 0 : t;
}

export const GET: APIRoute = async () => {
  const site = import.meta.env.SITE ?? 'https://mpstaton.com';
  const base = import.meta.env.BASE_URL ?? '/';
  const root = new URL(base, site).toString().replace(/\/$/, '');

  // ── Essays ───────────────────────────────────────────────────────────
  let essaysAll: Awaited<ReturnType<typeof getCollection<'essays'>>> = [];
  try { essaysAll = await getCollection('essays'); } catch { essaysAll = []; }
  const essays = essaysAll.filter((e) => isPublished(e.data as AnyData));
  essays.sort((a, b) => {
    const da = entryDateMs(a.data as AnyData);
    const db = entryDateMs(b.data as AnyData);
    if (da !== db) return db - da;
    const ta = ((a.data as AnyData).title ?? a.id).toLowerCase();
    const tb = ((b.data as AnyData).title ?? b.id).toLowerCase();
    return ta.localeCompare(tb);
  });

  const essaysLines: string[] = [];
  for (const entry of essays) {
    const data = entry.data as AnyData;
    const title = data.title ?? entry.id;
    const url = `${root}/essays/${entry.id}/`;
    const lede = data.lede ?? data.description ?? data.summary;
    essaysLines.push(lede ? `- [${title}](${url}): ${lede}` : `- [${title}](${url})`);
  }

  // ── Notes (from the rabbit hole) ─────────────────────────────────────
  let notesAll: Awaited<ReturnType<typeof getCollection<'notes'>>> = [];
  try { notesAll = await getCollection('notes'); } catch { notesAll = []; }
  const notes = notesAll.filter((e) => isPublished(e.data as AnyData));
  notes.sort((a, b) => {
    const da = entryDateMs(a.data as AnyData);
    const db = entryDateMs(b.data as AnyData);
    if (da !== db) return db - da;
    const ta = ((a.data as AnyData).title ?? a.id).toLowerCase();
    const tb = ((b.data as AnyData).title ?? b.id).toLowerCase();
    return ta.localeCompare(tb);
  });

  const notesLines: string[] = [];
  for (const entry of notes) {
    const data = entry.data as AnyData;
    const title = data.title ?? entry.id;
    const url = `${root}/notes/from-the-rabbit-hole/${entry.id}/`;
    const lede = data.lede ?? data.description ?? data.summary;
    notesLines.push(lede ? `- [${title}](${url}): ${lede}` : `- [${title}](${url})`);
  }

  // ── Context-V (rolled-up project documentation) ─────────────────────
  let contextVAll: Awaited<ReturnType<typeof getCollection<'context-v'>>> = [];
  try { contextVAll = await getCollection('context-v'); } catch { contextVAll = []; }
  const contextV = contextVAll.filter((e) => isPublished(e.data as AnyData));

  // Group by source repo (uses _context_v.repo_label, set by the fetcher).
  const byRepo = new Map<string, typeof contextV>();
  for (const entry of contextV) {
    const repo = ((entry.data as AnyData)._context_v?.repo_label as string | undefined) ?? 'mpstaton-site';
    if (!byRepo.has(repo)) byRepo.set(repo, [] as any);
    byRepo.get(repo)!.push(entry);
  }
  const repoNames = [...byRepo.keys()].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  for (const repo of repoNames) {
    byRepo.get(repo)!.sort((a, b) => {
      const da = entryDateMs(a.data as AnyData);
      const db = entryDateMs(b.data as AnyData);
      if (da !== db) return db - da;
      const ta = ((a.data as AnyData).title ?? a.id).toLowerCase();
      const tb = ((b.data as AnyData).title ?? b.id).toLowerCase();
      return ta.localeCompare(tb);
    });
  }

  const contextVLines: string[] = [];
  for (const repo of repoNames) {
    contextVLines.push(`### ${repo}`);
    contextVLines.push('');
    for (const entry of byRepo.get(repo)!) {
      const data = entry.data as AnyData;
      const title = data.title ?? entry.id.split('/').pop() ?? entry.id;
      const url = `${root}/context-vigilance/${entry.id}/`;
      const lede = data.lede ?? data.summary ?? data.description ?? data.purpose;
      contextVLines.push(lede ? `- [${title}](${url}): ${lede}` : `- [${title}](${url})`);
    }
    contextVLines.push('');
  }

  // ── Changelog ────────────────────────────────────────────────────────
  let changelogAll: Awaited<ReturnType<typeof getCollection<'changelog'>>> = [];
  try { changelogAll = await getCollection('changelog'); } catch { changelogAll = []; }
  // changelog schema only has `title` + `date` — no publish gate, but apply
  // the defensive predicate anyway in case fields are added later.
  const changelog = changelogAll.filter((e) => isPublished(e.data as AnyData));
  changelog.sort((a, b) => {
    const da = entryDateMs(a.data as AnyData);
    const db = entryDateMs(b.data as AnyData);
    if (da !== db) return db - da;
    const ta = ((a.data as AnyData).title ?? a.id).toLowerCase();
    const tb = ((b.data as AnyData).title ?? b.id).toLowerCase();
    return ta.localeCompare(tb);
  });

  const changelogLines: string[] = [];
  for (const entry of changelog) {
    const data = entry.data as AnyData;
    const title = data.title ?? entry.id;
    const dateStr = (() => {
      const d = data.date;
      if (!d) return '';
      const dt = d instanceof Date ? d : new Date(d);
      return Number.isNaN(dt.getTime()) ? '' : dt.toISOString().slice(0, 10);
    })();
    const label = dateStr ? `${dateStr} — ${title}` : title;
    // No detail pages for changelog today; reference the filename for traceability.
    changelogLines.push(`- ${label} (\`${entry.id}\`)`);
  }

  const tokens: Record<string, string> = {
    SITE_NAME: SITE_SEO.siteName,
    ESSAY_COUNT: String(essays.length),
    NOTE_COUNT: String(notes.length),
    CONTEXTV_COUNT: String(contextV.length),
    CHANGELOG_COUNT: String(changelog.length),
    REPO_COUNT: String(repoNames.length),
    LLMS_FULL_URL: `${root}/llms-full.txt`,
    LLMS_INDEX_URL: `${root}/llms.txt`,
    ESSAYS_INDEX: essaysLines.join('\n').trimEnd(),
    NOTES_INDEX: notesLines.join('\n').trimEnd(),
    CONTEXTV_INDEX: contextVLines.join('\n').trimEnd(),
    CHANGELOG_INDEX: changelogLines.join('\n').trimEnd(),
  };

  const body = template.replace(/\{\{(\w+)\}\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(tokens, name) ? tokens[name] : match,
  );

  return new Response(body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
