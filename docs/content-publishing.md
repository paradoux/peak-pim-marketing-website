# Content Publishing

This site has two draft-ready content collections:

- `src/content/articles`
- `src/content/guides`

Each entry is a Markdown file with typed frontmatter. The build validates required fields, SEO metadata, and collection-specific fields.

## Publishing Rules

- Keep `draft: true` while writing.
- Keep `noindex: true` while an entry should stay out of search.
- Set `draft: false` and `noindex: false` to publish an entry.
- Published articles appear at `/blog/[slug]`.
- Published guides appear at `/guides/[slug]`.
- Only published entries are added to `/sitemap.xml`.
- Empty `/blog` and `/guides` listing pages are marked `noindex,nofollow`.

## Article Fields

Required:

- `title`
- `description`
- `publishDate`
- `category`
- `excerpt`

Optional:

- `seoTitle`
- `seoDescription`
- `updatedDate`
- `author`
- `tags`
- `coverImage`
- `coverAlt`
- `readingTime`
- `relatedPages`

## Guide Fields

Required:

- `title`
- `description`
- `publishDate`
- `difficulty`
- `useCase`

Optional:

- `seoTitle`
- `seoDescription`
- `updatedDate`
- `author`
- `tags`
- `coverImage`
- `coverAlt`
- `estimatedReadTime`
- `steps`
- `relatedFeatures`

## JSON-LD

Templates generate structured data automatically:

- Articles use `BlogPosting`.
- Guides use `HowTo`.

The admin page at `/admin` shows collection entries, draft/published status, metadata lengths, and schema type.
