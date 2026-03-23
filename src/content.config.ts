import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional().default(false),
  }),
});

const portfolio = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    description: z.string().optional(),
    sector: z.string().optional(),
    stage: z.string().optional(),
    year: z.number().optional(),
    status: z.enum(['Active', 'Exited', 'Written Off']).optional(),
    url: z.string().url().optional(),
    logo: z.string().optional(),
  }),
});

export const collections = {
  blog,
  portfolio,
};
