import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const baseSeoFields = {
  title: z.string().min(1),
  description: z.string().min(1),
  seoTitle: z.string().min(1).optional(),
  seoDescription: z.string().min(1).optional(),
  canonicalPath: z.string().startsWith("/").optional(),
  publishDate: z.date(),
  updatedDate: z.date().optional(),
  author: z.string().default("Peak PIM"),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(true),
  noindex: z.boolean().default(false),
  coverImage: z.string().startsWith("/").optional(),
  coverAlt: z.string().optional(),
};

const articles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/articles" }),
  schema: z.object({
    ...baseSeoFields,
    category: z.string().min(1),
    excerpt: z.string().min(1),
    readingTime: z.string().optional(),
    relatedPages: z.array(z.string()).default([]),
  }),
});

const guides = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/guides" }),
  schema: z.object({
    ...baseSeoFields,
    difficulty: z.enum(["beginner", "intermediate", "advanced"]),
    useCase: z.string().min(1),
    estimatedReadTime: z.string().optional(),
    steps: z.array(z.string()).default([]),
    relatedFeatures: z.array(z.string()).default([]),
  }),
});

export const collections = {
  articles,
  guides,
};
