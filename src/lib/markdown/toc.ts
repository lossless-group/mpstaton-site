/**
 * toc.ts — the one place that decides which LFM headings become ToC entries.
 *
 * Shared by TableOfContents.astro (which renders them) and by any page that
 * needs to know *whether* a ToC will appear before it commits to a layout —
 * the essay rail reserves a 15rem column, and reserving it for a ToC that
 * renders nothing would squash the article into the gutter.
 *
 * Blueprint: astro-knots/context-v/blueprints/
 *            Standard-Table-of-Contents-for-Every-Markdown-Collection.md
 */
import { filterHeadings, type LfmHeading } from '@lossless-group/lfm';

export interface TocSelectOptions {
  /** Shallowest heading level to include. */
  minDepth?: number;
  /** Deepest heading level to include. */
  maxDepth?: number;
  /**
   * Container names whose headings stay out of the outline. A `###` inside a
   * callout deserves an anchor but is an aside, not a waypoint; a `:::details`
   * heading is genuinely navigable. Per-container rather than a boolean,
   * because that distinction is real.
   */
  excludeContainers?: string[];
}

/** h2–h3 is the readable band; deeper is available and usually noise. */
export const TOC_MIN_DEPTH = 2;
export const TOC_MAX_DEPTH = 3;
/** Below this many entries the ToC renders nothing — a 2-item outline is noise. */
export const TOC_MIN_ENTRIES = 3;
export const TOC_EXCLUDE_CONTAINERS = ['callout', 'image-carousel', 'blockquote'];

/**
 * Apply the depth band, drop `synthetic` entries (filterHeadings does both),
 * then drop headings nested inside containers the site treats as asides.
 */
export function selectTocEntries(
  headings: LfmHeading[] = [],
  {
    minDepth = TOC_MIN_DEPTH,
    maxDepth = TOC_MAX_DEPTH,
    excludeContainers = TOC_EXCLUDE_CONTAINERS,
  }: TocSelectOptions = {}
): LfmHeading[] {
  return filterHeadings(headings, minDepth, maxDepth).filter(
    (h) => !h.inContainer || !excludeContainers.includes(h.inContainer)
  );
}

/** Whether TableOfContents will render anything for this outline. */
export function hasTableOfContents(
  headings: LfmHeading[] = [],
  options: TocSelectOptions & { minEntries?: number } = {}
): boolean {
  const { minEntries = TOC_MIN_ENTRIES, ...select } = options;
  return selectTocEntries(headings, select).length >= minEntries;
}
