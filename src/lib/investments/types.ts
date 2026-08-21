import type { CollectionEntry } from 'astro:content';

/**
 * OpenGraph metadata for a company, after the frontmatter overrides have been
 * layered over whatever the build-time fetch returned.
 *
 * `status` is diagnostic, not decorative — it is what tells you whether a
 * thin-looking card is thin because the company site has no OG tags, because
 * the fetch failed, or because no `company_url` was authored at all. The card
 * renders the same in every case; the value exists so /design-system and a
 * dev-mode console line can say which case you are looking at.
 */
export interface InvestmentOg {
  title?: string;
  description?: string;
  image?: string;
  /** Publisher display name; falls back to the URL host. */
  source?: string;
  sourceUrl?: string;
  /** `none` means no company_url was authored, so nothing was ever attempted. */
  status: 'hit' | 'miss' | 'failed' | 'none';
}

/**
 * One company, assembled from its memo's frontmatter plus fetched OG data.
 *
 * This is the single shape both surfaces render from. /hype-machine reads the
 * company fields (og, zinger, myTake, facts); /investments reads the document
 * fields (title, lede, dates, tags) and the memo body. Neither surface reads
 * raw frontmatter directly — every fallback chain lives in `companies.ts` so
 * the two pages cannot drift apart on what "the title" means.
 */
export interface Investment {
  /** Route segment on both /hype-machine/[investment] and /investments/[investment]. */
  slug: string;
  /** Company display name. Falls back to the memo title. */
  companyName: string;
  /** The memo's own title. */
  title: string;
  lede?: string;

  /** Michael's one-liner for the card. Falls back to lede, then OG description. */
  zinger?: string;
  /** The enthusiastic read. The only long-form comment /hype-machine shows. */
  hypeNote?: string;
  /** The investor read — reservations and verdict. /investments only. */
  myTake?: string;

  stage?: string;
  verdict?: string;
  score?: string;
  status?: string;
  tags: string[];

  companyUrl?: string;
  /** Hostname with `www.` stripped — the display form. */
  host?: string;
  /** Google's favicon service; works for any domain with a discoverable icon. */
  faviconUrl?: string;
  accentColor?: string;

  og: InvestmentOg;

  hype: boolean;
  hypeRank: number;

  dateAuthored?: string;
  dateModified?: string;

  /** The underlying entry, so a detail page can render `entry.body`. */
  entry: CollectionEntry<'investment-memos'>;
}
