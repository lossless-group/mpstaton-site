import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { fetchCompanyOg } from './og';
import type { Investment } from './types';

/**
 * Loader for the `investment-memos` collection, normalized into `Investment`.
 *
 * Every fallback chain the two surfaces depend on lives here. /hype-machine
 * and /investments are deliberately redundant views of the same set, and the
 * fastest way for them to stop agreeing is for each page to re-derive "the
 * company name" or "the description" from raw frontmatter on its own.
 */

function slugify(value: string): string {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')  // TrustedRouter -> Trusted-Router
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Route segment for a memo.
 *
 * Prefers an explicit frontmatter `slug`, then the memo's DIRECTORY name — not
 * its filename and not its title. The directory is the stable identity: the
 * orchestrator writes `<Company>/<Company>.md`, and a memo that later gains a
 * v2 file alongside it keeps the same directory and therefore the same URL.
 */
function slugFor(entry: CollectionEntry<'investment-memos'>): string {
  const explicit = (entry.data as any).slug;
  if (explicit) return slugify(String(explicit));
  const dir = entry.id.split('/')[0];
  return slugify(dir || entry.id);
}

function hostOf(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}

let cache: Promise<Investment[]> | null = null;

async function load(): Promise<Investment[]> {
  const entries = await getCollection('investment-memos');

  // Fetch every company's OG in one dispatcher pass before building any card,
  // rather than awaiting per-company inside the map. See og.ts on why this is
  // one pass per build.
  const urls = entries
    .map((e) => (e.data as any).company_url as string | undefined)
    .filter((u): u is string => Boolean(u));
  const ogByUrl = await fetchCompanyOg(urls);

  const investments = entries.map((entry): Investment => {
    const d = entry.data as any;
    const companyUrl = d.company_url as string | undefined;
    const fetched = companyUrl ? ogByUrl.get(companyUrl) : undefined;
    const host = hostOf(companyUrl);

    // Frontmatter overrides win over the fetch, always. A company site that
    // ships no OG tags, blocks bots, or describes itself badly is corrected by
    // authoring og_* keys — never by disabling the fetch for everyone.
    const og = {
      title: d.og_title ?? fetched?.title,
      description: d.og_description ?? fetched?.description,
      image: d.og_image ?? fetched?.image,
      source: fetched?.source ?? host,
      sourceUrl: fetched?.sourceUrl ?? companyUrl,
      status: companyUrl ? (fetched?.status ?? 'failed') : ('none' as const),
    } satisfies Investment['og'];

    return {
      slug: slugFor(entry),
      companyName: d.company_name ?? d.title ?? entry.id,
      title: d.title ?? entry.id,
      lede: d.lede,
      // The card leads with Michael's line when he wrote one. The memo's lede
      // is the second choice and the company's own OG description is the last
      // — a company describing itself is the least interesting of the three.
      zinger: d.zinger ?? d.lede ?? og.description,
      hypeNote: d.hype_note,
      myTake: d.my_take,
      stage: d.stage,
      verdict: d.verdict,
      score: d.score,
      status: d.status,
      tags: Array.isArray(d.tags) ? d.tags : [],
      companyUrl,
      host,
      faviconUrl: host
        ? `https://www.google.com/s2/favicons?domain=${host}&sz=64`
        : undefined,
      accentColor: d.accent_color,
      og,
      hype: d.hype === true,
      hypeRank: typeof d.hype_rank === 'number' ? d.hype_rank : Number.MAX_SAFE_INTEGER,
      dateAuthored: d.date_authored_initial_draft ?? d.date_created,
      dateModified: d.date_modified,
      entry,
    };
  });

  if (import.meta.env.DEV) {
    const thin = investments.filter((i) => i.og.status !== 'hit' && i.og.status !== 'miss');
    if (thin.length > 0) {
      console.log(
        `[investments] ${thin.length}/${investments.length} without OG data: ` +
          thin.map((i) => `${i.slug} (${i.og.status})`).join(', ')
      );
    }
  }

  return investments;
}

/** Every memo, newest first. Backs /investments. */
export async function getAllInvestments(): Promise<Investment[]> {
  // Dev bypasses the cache so frontmatter edits surface on the next request.
  // The OG dispatcher keeps its own per-process memo, so this does not mean
  // re-fetching the network on every keystroke.
  if (!cache || import.meta.env.DEV) cache = load();
  const all = await cache;
  return [...all].sort((a, b) => {
    const at = a.dateModified ?? a.dateAuthored ?? '';
    const bt = b.dateModified ?? b.dateAuthored ?? '';
    return bt.localeCompare(at);
  });
}

/** Only the companies flagged `hype: true`, in `hype_rank` order. Backs /hype-machine. */
export async function getHypedInvestments(): Promise<Investment[]> {
  const all = await getAllInvestments();
  return all
    .filter((i) => i.hype)
    .sort((a, b) => a.hypeRank - b.hypeRank || a.companyName.localeCompare(b.companyName));
}

export async function getInvestment(slug: string): Promise<Investment | null> {
  const all = await getAllInvestments();
  return all.find((i) => i.slug === slug) ?? null;
}
