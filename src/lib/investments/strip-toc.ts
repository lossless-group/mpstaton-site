import type { LfmHeading } from '@lossless-group/lfm';

/**
 * Remove the memo's own authored "Table of Contents" section from the tree.
 *
 * The memos carry an inline ToC because the same document is used in several
 * places — exported to PDF above all, where there is no sidebar and no
 * scroll-spy, so a printed page genuinely needs its own contents list. On the
 * web that list is redundant with the ToC rail beside the article, and worse
 * than redundant: it is a second, static outline that silently disagrees with
 * the live one the moment a heading is edited.
 *
 * So the markdown keeps it and the web render drops it. The source stays the
 * single artifact that serves both surfaces.
 *
 * WHAT GETS REMOVED: the ToC heading itself, and every sibling after it until
 * the next heading at the same depth or shallower. In these memos that span is
 * `## Table of Contents`, the nested ordered list, and the `---` rule before
 * `# Executive Summary` — the rule is part of the ToC block's own framing, and
 * leaving it behind would stack two horizontal rules with nothing between them.
 */

/** Heading text that identifies an authored ToC. Matched case-insensitively. */
const TOC_HEADING = /^(table of contents|contents)$/i;

function headingText(node: any): string {
  // Prefer the plain text LFM already computed; fall back to walking children
  // so this works on a tree that has not been through remarkHeadingIds.
  if (node?.data?.text) return String(node.data.text);
  const parts: string[] = [];
  const walk = (n: any) => {
    if (typeof n?.value === 'string') parts.push(n.value);
    if (Array.isArray(n?.children)) n.children.forEach(walk);
  };
  walk(node);
  return parts.join('').trim();
}

export interface StripTocResult<T> {
  tree: T;
  /** `headings` with the ToC entry removed, so the rail does not list it either. */
  headings: LfmHeading[];
  /** True when a ToC section was found and removed — surfaced for dev logging. */
  removed: boolean;
}

/**
 * Strip the authored ToC from a parsed memo.
 *
 * Runs AFTER `processor.run()` rather than as a plugin, deliberately. LFM's
 * `remarkHeadingIds` has already populated `tree.data.headings` by then, so the
 * outline and the tree can be filtered against the same predicate in one place.
 * A plugin appended with `.use()` would run after that pass anyway and would
 * still leave "Table of Contents" sitting in the rail.
 *
 * Mutates `tree.children` in place (the tree is freshly parsed per request and
 * has no other referent) and returns a filtered copy of the headings array.
 */
export function stripAuthoredToc<T extends { children?: any[]; data?: any }>(
  tree: T,
  headings: LfmHeading[] = []
): StripTocResult<T> {
  const children = tree?.children;
  if (!Array.isArray(children)) return { tree, headings, removed: false };

  const start = children.findIndex(
    (n) => n?.type === 'heading' && TOC_HEADING.test(headingText(n))
  );
  if (start === -1) return { tree, headings, removed: false };

  const tocDepth = children[start].depth ?? 2;
  const tocId = children[start]?.data?.id ?? children[start]?.data?.hProperties?.id;

  // Scan forward to the next heading that is a sibling-or-parent of the ToC.
  // Everything between is the ToC's own content.
  let end = start + 1;
  while (end < children.length) {
    const n = children[end];
    if (n?.type === 'heading' && (n.depth ?? 6) <= tocDepth) break;
    end++;
  }

  children.splice(start, end - start);

  // Drop the same heading from the outline. Match on id when LFM assigned one
  // (exact and collision-safe), on text otherwise.
  const filtered = headings.filter((h) =>
    tocId ? h.id !== tocId : !TOC_HEADING.test(h.text ?? '')
  );

  return { tree, headings: filtered, removed: true };
}
