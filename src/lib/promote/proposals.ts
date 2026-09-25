/**
 * Proposal loader — the memo-forward material type.
 *
 * A proposal is a SEQUENCE OF MARKDOWN SECTIONS, not a folder of bespoke Astro
 * components. That is the whole point of this material type, and the correction
 * of what went wrong with the scroll decks: there, the narrative markdown under
 * `content/promote/{slug}/narratives/` was a *brief to an agent* ("two columns,
 * joined by a connector element") while the real copy was re-authored inside
 * `layouts/sections/promote/{slug}/deck/scroll/vN/SNN-*.astro` with hardcoded
 * gradients. Copy and design iterated in the same file, so neither converged.
 *
 * Here the markdown IS the content of record. Each section's frontmatter picks
 * a `layout` from a small fixed vocabulary, and the design lives in
 * `styles/proposal.css` + `components/promote/proposal/`. Editing a sentence
 * never means opening an .astro file.
 *
 * Citations get renumbered across the whole document — see `renumber()`.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { parseMarkdown } from '@lossless-group/lfm';
import { vegaLite } from '@lossless-group/lfm/formats';
import { visit } from 'unist-util-visit';
import { opportunityDir } from './opportunities';
import { ogFetchOptions } from './og-fetch';

export type ProposalLayout =
  | 'cover'
  | 'prose'
  | 'two-column'
  | 'stat-row'
  | 'table'
  | 'band';

const LAYOUTS: ProposalLayout[] = ['cover', 'prose', 'two-column', 'stat-row', 'table', 'band'];

export interface ProposalStat {
  value: string;
  label: string;
  note?: string;
}

export interface ProposalColumn {
  title: string;
  body?: string;
  items?: string[];
  /** Small chip above the title — "Status quo", "VAR possibility". */
  label?: string;
  /**
   * The one-line mindset contrast, rendered as a footer strip. This is the
   * payload of a comparison column: two sets of bullets read as equivalent
   * until something names what they mean.
   */
  mindset?: string;
  /**
   * Visual weight. `muted` deliberately drains the card — dull border, flat
   * ground, grey bullets — so a status-quo column reads as inert beside an
   * `accent` one. Absent means neutral, which is right when columns are peers
   * rather than a before/after.
   */
  tone?: 'muted' | 'accent';
}

export interface ProposalSectionData {
  /** Anchor id, from the filename with its numeric prefix stripped. */
  id: string;
  /** Display number for the chapter card and the section rule, e.g. "01". */
  chapter: string;
  title: string;
  eyebrow?: string;
  headline?: string;
  subhead?: string;
  layout: ProposalLayout;
  /** One line on the chapter card. Falls back to `subhead`. */
  cardSummary?: string;
  stats?: ProposalStat[];
  columns?: ProposalColumn[];
  /** Parsed MDAST of the body, or null when the section is chrome-only. */
  tree: any | null;
  /** True when the body is only frontmatter — the card still renders. */
  empty: boolean;
}

export interface ProposalDoc {
  version: number;
  sections: ProposalSectionData[];
  /** Document-wide ordered citations, renumbered across sections. */
  citations: any[];
  /**
   * One outline for the whole document, in the shape TableOfContents.astro
   * expects. Each section contributes a depth-2 entry for its chapter title
   * (anchored on the section id) followed by that section's own `###`
   * headings at depth 3 — so the rail nests chapters over subsections.
   */
  headings: { id: string; text: string; depth: number; inContainer?: string }[];
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

function splitFrontmatter(source: string): { data: Record<string, any>; body: string } {
  const match = source.match(FRONTMATTER);
  if (!match) return { data: {}, body: source };
  const data = (parseYaml(match[1]) ?? {}) as Record<string, any>;
  return { data, body: source.slice(match[0].length) };
}

function proposalDir(slug: string, version: number): string {
  return join(opportunityDir(slug), 'proposal', `v${version}`, 'sections');
}

export function listProposalVersions(slug: string): number[] {
  const root = join(opportunityDir(slug), 'proposal');
  if (!existsSync(root)) return [];
  return readdirSync(root)
    .map((entry) => entry.match(/^v(\d+)$/)?.[1])
    .filter((n): n is string => !!n)
    .map((n) => parseInt(n, 10))
    .sort((a, b) => a - b);
}

/**
 * Sections are parsed one file at a time, so `remarkCitations` numbers each
 * section's footnotes from 1 — three sections with one citation each would all
 * render as `[1]`. This walks the trees in document order and rewrites
 * `data.citationIndex` against a document-wide map keyed on `citationHex`, so a
 * hex reused in two sections keeps one number and the Sources list has no gaps.
 */
function renumber(parsed: { tree: any; citations: any[] }[]): any[] {
  const indexByHex = new Map<string, number>();
  const ordered: any[] = [];

  for (const { tree, citations } of parsed) {
    if (!tree) continue;
    visit(tree, 'footnoteReference', (node: any) => {
      const hex = node.data?.citationHex ?? node.identifier;
      if (!hex) return;
      let index = indexByHex.get(hex);
      if (index === undefined) {
        index = ordered.length + 1;
        indexByHex.set(hex, index);
        const source = citations.find((c: any) => c.hex === hex || c.identifier === hex);
        ordered.push({ ...(source ?? { hex, identifier: hex, raw: hex, parsed: false }), index });
      }
      node.data = { ...(node.data ?? {}), citationIndex: index, citationHex: hex };
    });
  }

  return ordered;
}

export async function loadProposal(slug: string, version: number): Promise<ProposalDoc | null> {
  const dir = proposalDir(slug, version);
  if (!existsSync(dir)) return null;

  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .sort((a, b) => a.localeCompare(b));
  if (files.length === 0) return null;

  const ogFetch = ogFetchOptions();

  const sections: ProposalSectionData[] = [];
  const parsed: { tree: any; citations: any[] }[] = [];

  for (const [i, file] of files.entries()) {
    const { data, body } = splitFrontmatter(readFileSync(join(dir, file), 'utf-8'));
    const stem = file.replace(/\.md$/, '');
    const numeric = stem.match(/^(\d+)[-_]?(.*)$/);

    const hasBody = body.trim().length > 0;
    let tree: any = null;
    let citations: any[] = [];
    if (hasBody) {
      const codeFences = { formats: [vegaLite] };
      try {
        tree = (await parseMarkdown(body, { ogFetch, codeFences })) as any;
      } catch (err) {
        // Link previews are an enhancement; the proposal is the deliverable.
        // Anything the OG stage can throw — a timeout, a read-only cache write —
        // costs the previews, never the page.
        console.warn(`[proposals] OG enrichment failed for ${file}; rendering without previews.`, err);
        tree = (await parseMarkdown(body, { codeFences })) as any;
      }
      citations = tree.data?.citations?.ordered ?? [];
    }
    parsed.push({ tree, citations });

    const layout = LAYOUTS.includes(data.layout) ? (data.layout as ProposalLayout) : 'prose';

    sections.push({
      id: data.id ?? (numeric?.[2] || stem),
      chapter: data.chapter ?? numeric?.[1] ?? String(i + 1).padStart(2, '0'),
      title: data.title ?? stem,
      eyebrow: data.eyebrow,
      headline: data.headline,
      subhead: data.subhead,
      layout,
      cardSummary: data.card_summary ?? data.subhead,
      stats: Array.isArray(data.stats) ? data.stats : undefined,
      columns: Array.isArray(data.columns) ? data.columns : undefined,
      tree,
      empty: !hasBody,
    });
  }

  // Build the document outline. Body headings keep the ids LFM assigned them,
  // but those ids are only unique WITHIN a section — two sections can both
  // have "### The two options". A duplicate id would render an anchor that
  // jumps to the wrong section, so a colliding body heading is left out of the
  // outline rather than shipped broken.
  const headings: ProposalDoc['headings'] = [];
  const seen = new Set<string>();
  sections.forEach((section, i) => {
    headings.push({ id: section.id, text: section.title, depth: 2 });
    seen.add(section.id);
    const bodyHeadings = (parsed[i]?.tree?.data?.headings ?? []) as ProposalDoc['headings'];
    for (const h of bodyHeadings) {
      if (!h?.id || seen.has(h.id)) continue;
      seen.add(h.id);
      headings.push({ ...h, depth: 3 });
    }
  });

  return { version, sections, citations: renumber(parsed), headings };
}
