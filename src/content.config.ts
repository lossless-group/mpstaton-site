import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const changelog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/changelog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
  }),
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
    augmented_with: z.string().optional(),
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

export const collections = {
  changelog,
  'context-v': contextV,
};
