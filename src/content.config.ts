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

export const collections = {
  changelog,
  'context-v': contextV,
  'notes': notes,
  essays,
};
