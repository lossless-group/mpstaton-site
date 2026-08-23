import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const changelog = defineCollection({
  // Repo-root `changelog/`, matching the tree-wide convention every other
  // Lossless repo uses. It was previously `./src/content/changelog`, which
  // split this site's log in two: entries written before 2026-05-09 lived
  // here and rendered, while later ones were authored at the repo root and
  // rendered nowhere. The corpus ingester made the same split in reverse —
  // it skips any path containing `/src/`, so it saw only the root entries.
  // One directory now serves both the site and retrieval.
  loader: glob({ pattern: '**/*.md', base: './changelog' }),
  schema: z.object({
    title: z.string(),

    // Dates — every spelling optional + nullable.
    // `date` is the legacy key this site was built on; the tree-wide
    // frontmatter standard renames it to the editorial pair below. Requiring
    // `date` made that rename a build-breaking change, so nothing date-shaped
    // is required now — consumers resolve one through the fallback chain in
    // src/utils/changelog-date.ts.
    //
    // This matters past the build: Graphiti anchors each changelog episode on
    // `date_authored_initial_draft`, falling back to `date`, then the
    // filesystem dates, then mtime. An entry that reaches the mtime fallback
    // lands at the wrong point in the temporal graph, because a reformat pass
    // rewrites mtime.
    date: z.coerce.date().nullable().optional(),
    date_authored_initial_draft: z.coerce.date().nullable().optional(),
    date_authored_current_draft: z.coerce.date().nullable().optional(),
    date_created: z.coerce.date().nullable().optional(),
    date_modified: z.coerce.date().nullable().optional(),

    // Editorial + identity — accepted so the keys round-trip through the
    // standard and reach the retrieval layers.
    publish: z.boolean().optional(),
    lede: z.string().optional(),
    summary: z.string().optional(),
    site_uuid: z.string().optional(),
    hex_code: z.string().optional(),
    authors: z.array(z.string()).optional(),

    // The AI counterpart to `authors`, in `<tool> on <model name version>` form.
    // Deliberately the most permissive field here: never required, and a scalar
    // is accepted alongside the canonical list. Attribution a contributor forgot
    // — or wrote as one line instead of a ul — is a frontmatter nit, not a reason
    // to fail a build, and a hard failure here would only teach people to drop
    // the key. Consumers normalize with `[data.augmented_with ?? []].flat()`.
    augmented_with: z.union([z.string(), z.array(z.string())]).nullable().optional(),

    tags: z.array(z.string()).optional(),
  }).passthrough(),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes/from-the-rabbit-hole' }),
  schema: z.object({
    title: z.string().optional(),
    lede: z.string().optional(),
    date_created: z.coerce.string().optional(),
    date_modified: z.coerce.string().optional(),
    authors: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  }).passthrough(),
});

const contextV = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/context-v' }),
  schema: z.object({
    title: z.string().optional(),
    lede: z.string().optional(),
    category: z.string().optional(),
    status: z.string().optional(),
    date_created: z.string().optional(),
    date_modified: z.string().optional(),
    date_authored_initial_draft: z.string().optional(),
    date_authored_current_draft: z.string().optional(),
    authors: z.array(z.string()).optional(),
    augmented_with: z.coerce.string().optional(),
    tags: z.array(z.string()).optional(),
    at_semantic_version: z.string().optional(),
    publish: z.boolean().optional(),
    _context_v: z.object({
      repo: z.string(),
      repo_label: z.string(),
      branch: z.string(),
      commit_sha: z.string(),
      file_path: z.string(),
      fetched_at: z.string(),
      github_url: z.string(),
    }).optional(),
  }).passthrough(),
});

const essays = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/essays' }),
  schema: z.object({
    title: z.string().optional(),
    lede: z.string().optional(),
    date_created: z.coerce.string().optional(),
    date_modified: z.coerce.string().optional(),
    date_authored_initial_draft: z.coerce.string().optional(),
    date_authored_current_draft: z.coerce.string().optional(),
    status: z.string().nullable().optional(),
    category: z.string().nullable().optional(),
    authors: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    portrait_image: z.string().optional(),
    banner_image: z.string().optional(),
    image_prompt: z.string().optional(),
    augmented_with: z.coerce.string().optional(),
    at_semantic_version: z.string().optional(),
  }).passthrough(),
});

// Investment memos. Deliberately PERMISSIVE: every field optional plus
// .passthrough(), matching how `contextV` treats context-v frontmatter. These
// files are generated by memopop-orchestrator, whose frontmatter vocabulary
// evolves — a hard schema would fail the build on a field the pipeline added,
// which is the wrong failure mode for content that is authored elsewhere.
const investmentMemos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/investments/memos' }),
  schema: z.object({
    title: z.string().optional(),
    lede: z.string().optional(),
    category: z.string().optional(),
    status: z.string().nullable().optional(),
    publish: z.boolean().optional(),
    date_created: z.coerce.string().optional(),
    date_modified: z.coerce.string().optional(),
    date_authored_initial_draft: z.coerce.string().optional(),
    date_authored_current_draft: z.coerce.string().optional(),
    date_authored_final_draft: z.coerce.string().nullable().optional(),
    at_semantic_version: z.coerce.string().optional(),
    authors: z.array(z.string()).optional(),
    augmented_with: z.union([z.string(), z.array(z.string())]).optional(),
    tags: z.array(z.string()).optional(),
    site_uuid: z.string().optional(),
    hex_code: z.string().optional(),

    // --- Company layer -------------------------------------------------
    // Hand-authored keys the orchestrator does not write. They describe the
    // COMPANY rather than the document, and they are what /hype-machine
    // renders. Every one is optional: a memo that arrives with none of them
    // still lists on /investments, it just gets no OG card and no take.
    //
    // `company_url` is the OG source of truth — src/lib/investments/og.ts
    // fetches it at build time through LFM's dispatcher and caches the
    // result. Without it there is nothing to fetch and the card falls back
    // to title + lede.
    company_url: z.string().optional(),
    // Display name when it differs from `title` (title is the memo's name,
    // which for Chroma is "Chroma" but for others may carry a suffix).
    company_name: z.string().optional(),
    // Route segment. Defaults to the memo's directory name, slugified.
    slug: z.string().optional(),

    // Listing control. `hype: true` puts the company on /hype-machine;
    // /investments lists every memo regardless.
    hype: z.boolean().optional(),
    // Ordering within /hype-machine — lower sorts first, absent sorts last.
    hype_rank: z.number().optional(),

    // Michael's comments, split by voice because the two surfaces want
    // opposite registers of the same opinion.
    //
    // `hype_note` is the enthusiastic read — why this company is worth
    // someone's attention. It is the only long-form comment /hype-machine
    // shows, and it should never carry a hedge or a score.
    //
    // `my_take` is the investor read — the reservation, the open question,
    // the verdict. It belongs on /investments beside the scorecard, and is
    // deliberately absent from the hype surface.
    //
    // `zinger` is the one-line hook both surfaces lead with (falls back to
    // `lede`, then the company's own OG description).
    hype_note: z.string().optional(),
    my_take: z.string().optional(),
    zinger: z.string().optional(),

    // Deal shape — rendered as facts on the card and the profile.
    stage: z.string().optional(),
    verdict: z.string().optional(),
    score: z.coerce.string().optional(),

    // Manual OG overrides. Set any of these when the fetched metadata is
    // wrong, thin, or the company site blocks crawlers — they win over
    // whatever the dispatcher returns, so a bad fetch is always correctable
    // without disabling the fetch.
    og_title: z.string().optional(),
    og_description: z.string().optional(),
    og_image: z.string().optional(),
    accent_color: z.string().optional(),
  }).passthrough(),
});


// Diary — events with an itinerary, in the British sense of the word: the book
// you keep your engagements in. Each entry is one multi-day event; the body is
// free-form notes, and the schedule lives in frontmatter because it is
// structured data (times, rooms, speakers, availability) rather than prose.
//
// Permissive like `contextV` and `investmentMemos`: an itinerary is typically
// transcribed from a conference export under time pressure, and a missing room
// name should degrade the card, not fail the build. The one place this schema
// IS strict is time strings — those are validated at render by
// src/lib/diary/schedule.ts, which throws on a malformed or non-tiling
// schedule, because a silently wrong availability bar is worse than no bar.
const diary = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/diary' }),
  schema: z.object({
    title: z.string().optional(),
    host: z.string().optional(),
    lede: z.string().optional(),
    summary: z.string().optional(),

    date_start: z.coerce.date().optional(),
    date_end: z.coerce.date().optional(),

    location: z.string().optional(),
    locality: z.string().optional(),

    // Why a round trip to the nearest city costs what it costs. Every
    // "can I escape?" verdict on the page is downstream of this number, so it
    // is stated rather than assumed.
    travel: z.object({
      hub: z.string().optional(),
      round_trip_minutes: z.number().optional(),
      note: z.string().optional(),
    }).passthrough().optional(),

    links: z.array(z.object({
      label: z.string(),
      url: z.string(),
      icon: z.string().optional(),
    }).passthrough()).optional(),

    // The clock range every availability bar is drawn against. Shared by all
    // days so the three bars are directly comparable.
    day_window: z.object({ start: z.string(), end: z.string() }).optional(),

    days: z.array(z.object({
      date: z.coerce.date().optional(),
      label: z.string().optional(),
      hours: z.string().optional(),
      blurb: z.string().optional(),
      verdict: z.string().optional(),
      bands: z.array(z.object({
        from: z.string(),
        to: z.string(),
        state: z.enum(['locked', 'open', 'free', 'transit']),
        label: z.string().optional(),
      }).passthrough()).optional(),
      sessions: z.array(z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        title: z.string().optional(),
        state: z.enum(['locked', 'open']).optional(),
        room: z.string().optional(),
        kind: z.string().optional(),
        desc: z.string().optional(),
        note: z.string().optional(),
        speakers: z.array(z.object({
          name: z.string(),
          org: z.string().optional(),
        }).passthrough()).optional(),
        // Concurrent options inside one slot — breakouts, workshops, two
        // dinners at the same hour. Rendered as a "pick one" cluster.
        tracks: z.array(z.object({
          title: z.string(),
          room: z.string().optional(),
          kind: z.string().optional(),
          desc: z.string().optional(),
          speakers: z.array(z.object({
            name: z.string(),
            org: z.string().optional(),
          }).passthrough()).optional(),
          more: z.string().optional(),
        }).passthrough()).optional(),
        tracks_label: z.string().optional(),
      }).passthrough()).optional(),
      panels: z.array(z.object({
        heading: z.string(),
        body: z.string().optional(),
        items: z.array(z.string()).optional(),
      }).passthrough()).optional(),
    }).passthrough()).optional(),

    // The paragraph to paste into an email when someone asks to meet.
    share_summary: z.string().optional(),

    logistics: z.array(z.object({
      heading: z.string(),
      body: z.string().optional(),
      pairs: z.array(z.object({ key: z.string(), value: z.string() }).passthrough()).optional(),
    }).passthrough()).optional(),

    source_note: z.string().optional(),
    publish: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  }).passthrough(),
});

export const collections = {
  changelog,
  'context-v': contextV,
  'notes': notes,
  essays,
  'investment-memos': investmentMemos,
  diary,
};
