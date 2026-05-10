/**
 * /llms-full.txt — concatenated raw markdown of every published essay,
 * note, context-v doc, and changelog entry on mpstaton.com.
 *
 * Spec: https://llmstxt.org/
 *
 * The human-editable prose template lives at `src/llms/llms-full.md` (with
 * token documentation in `src/llms/README.md`). This file is the dumb
 * assembler: load template, gather corpus bodies with metadata headers,
 * substitute tokens. Edit prose in the markdown — not here.
 */

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_SEO } from '../config/seo';
import template from '../llms/llms-full.md?raw';

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

function isoDate(value: unknown): string | undefined {
  if (!value) return undefined;
  const d = value instanceof Date ? value : new Date(value as any);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
}

export const GET: APIRoute = async () => {
  const site = import.meta.env.SITE ?? 'https://mpstaton.com';
  const base = import.meta.env.BASE_URL ?? '/';
  const root = new URL(base, site).toString().replace(/\/$/, '');

  let essaysAll: Awaited<ReturnType<typeof getCollection<'essays'>>> = [];
  try { essaysAll = await getCollection('essays'); } catch { essaysAll = []; }
  const essays = essaysAll.filter((e) => isPublished(e.data as AnyData));

  let notesAll: Awaited<ReturnType<typeof getCollection<'notes'>>> = [];
  try { notesAll = await getCollection('notes'); } catch { notesAll = []; }
  const notes = notesAll.filter((e) => isPublished(e.data as AnyData));

  let contextVAll: Awaited<ReturnType<typeof getCollection<'context-v'>>> = [];
  try { contextVAll = await getCollection('context-v'); } catch { contextVAll = []; }
  const contextV = contextVAll.filter((e) => isPublished(e.data as AnyData));

  let changelogAll: Awaited<ReturnType<typeof getCollection<'changelog'>>> = [];
  try { changelogAll = await getCollection('changelog'); } catch { changelogAll = []; }
  const changelog = changelogAll.filter((e) => isPublished(e.data as AnyData));

  type Kind = 'essay' | 'note' | 'context-v' | 'changelog';
  type Tagged = {
    kind: Kind;
    entry:
      | (typeof essays)[number]
      | (typeof notes)[number]
      | (typeof contextV)[number]
      | (typeof changelog)[number];
  };

  // Combine into a single ordered stream tagged by kind. Order: essays,
  // notes, context-v (grouped by repo), changelog. Within each group:
  // date desc, title alpha tiebreaker. Deterministic across builds.
  const stream: Tagged[] = [];

  const sortByDateThenTitle = <T extends { id: string; data: AnyData }>(arr: T[]) =>
    [...arr].sort((a, b) => {
      const da = entryDateMs(a.data);
      const db = entryDateMs(b.data);
      if (da !== db) return db - da;
      const ta = (a.data.title ?? a.id).toLowerCase();
      const tb = (b.data.title ?? b.id).toLowerCase();
      return ta.localeCompare(tb);
    });

  for (const entry of sortByDateThenTitle(essays)) stream.push({ kind: 'essay', entry });
  for (const entry of sortByDateThenTitle(notes)) stream.push({ kind: 'note', entry });

  // context-v: group by repo_label, alphabetical
  const byRepo = new Map<string, typeof contextV>();
  for (const entry of contextV) {
    const repo = ((entry.data as AnyData)._context_v?.repo_label as string | undefined) ?? 'mpstaton-site';
    if (!byRepo.has(repo)) byRepo.set(repo, [] as any);
    byRepo.get(repo)!.push(entry);
  }
  const repoNames = [...byRepo.keys()].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  for (const repo of repoNames) {
    for (const entry of sortByDateThenTitle(byRepo.get(repo)!)) {
      stream.push({ kind: 'context-v', entry });
    }
  }

  for (const entry of sortByDateThenTitle(changelog)) stream.push({ kind: 'changelog', entry });

  const bodyParts: string[] = [];
  for (const { kind, entry } of stream) {
    const data = entry.data as AnyData;
    const title = data.title ?? entry.id.split('/').pop() ?? entry.id;
    const lastModified = isoDate(
      data.date_modified ??
        data.date_authored_current_draft ??
        data.date_created ??
        data.date_authored_initial_draft ??
        data.date,
    );

    let url = '';
    let from: string | undefined;
    let sourcePath = entry.id;

    if (kind === 'essay') {
      url = `${root}/essays/${entry.id}/`;
    } else if (kind === 'note') {
      url = `${root}/notes/from-the-rabbit-hole/${entry.id}/`;
    } else if (kind === 'context-v') {
      url = `${root}/context-vigilance/${entry.id}/`;
      from = (data._context_v?.repo_label as string | undefined) ?? 'mpstaton-site';
      sourcePath = (data._context_v?.file_path as string | undefined) ?? entry.id;
    } else if (kind === 'changelog') {
      url = `${root}/`;
      sourcePath = `src/content/changelog/${entry.id}.md`;
    }

    bodyParts.push('---');
    bodyParts.push('');
    bodyParts.push(`## ${title}`);
    bodyParts.push('');
    bodyParts.push(`- Kind: \`${kind}\``);
    if (from) bodyParts.push(`- From: \`${from}\``);
    bodyParts.push(`- Source path: \`${sourcePath}\``);
    bodyParts.push(`- Canonical URL: ${url}`);
    if (lastModified) bodyParts.push(`- Last modified: ${lastModified}`);
    bodyParts.push('');
    bodyParts.push(entry.body ?? '');
    bodyParts.push('');
  }

  const tokens: Record<string, string> = {
    SITE_NAME: SITE_SEO.siteName,
    ESSAY_COUNT: String(essays.length),
    NOTE_COUNT: String(notes.length),
    CONTEXTV_COUNT: String(contextV.length),
    CHANGELOG_COUNT: String(changelog.length),
    REPO_COUNT: String(repoNames.length),
    LLMS_INDEX_URL: `${root}/llms.txt`,
    CORPUS_BODIES: bodyParts.join('\n').trimEnd(),
  };

  const body = template.replace(/\{\{(\w+)\}\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(tokens, name) ? tokens[name] : match,
  );

  return new Response(body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
