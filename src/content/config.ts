import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    cover: z.string().optional(),
    excerpt: z.string(),
    published: z.boolean().default(true),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = {
  blog,
};