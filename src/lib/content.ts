import { getCollection, type CollectionEntry } from "astro:content";
import { canonicalUrl, productionOrigin } from "./site-url";

export const siteUrl = productionOrigin;

export type ArticleEntry = CollectionEntry<"articles">;
export type GuideEntry = CollectionEntry<"guides">;
export type ContentEntry = ArticleEntry | GuideEntry;
export type ContentKind = "articles" | "guides";

export const contentRoutes: Record<ContentKind, { basePath: string; label: string; schemaType: string }> = {
  articles: {
    basePath: "/blog",
    label: "Articles",
    schemaType: "BlogPosting",
  },
  guides: {
    basePath: "/guides",
    label: "Guides",
    schemaType: "HowTo",
  },
};

export function isPublished(entry: ContentEntry) {
  return !entry.data.draft && !entry.data.noindex;
}

export function entryPath(kind: ContentKind, entry: ContentEntry) {
  return `${contentRoutes[kind].basePath}/${entry.id}`;
}

export function entryUrl(kind: ContentKind, entry: ContentEntry) {
  return canonicalUrl(entryPath(kind, entry));
}

export async function getPublishedArticles() {
  return (await getCollection("articles")).filter(isPublished).sort(byPublishDateDesc);
}

export async function getPublishedGuides() {
  return (await getCollection("guides")).filter(isPublished).sort(byPublishDateDesc);
}

export async function getAllContentEntries() {
  const [articles, guides] = await Promise.all([getCollection("articles"), getCollection("guides")]);

  return [
    ...articles.map((entry) => ({ kind: "articles" as const, entry })),
    ...guides.map((entry) => ({ kind: "guides" as const, entry })),
  ].sort((left, right) => byPublishDateDesc(left.entry, right.entry));
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function contentJsonLd(kind: ContentKind, entry: ContentEntry) {
  const route = contentRoutes[kind];
  const url = entryUrl(kind, entry);

  const base = {
    "@context": "https://schema.org",
    "@type": route.schemaType,
    headline: entry.data.title,
    description: entry.data.seoDescription ?? entry.data.description,
    datePublished: entry.data.publishDate.toISOString(),
    dateModified: (entry.data.updatedDate ?? entry.data.publishDate).toISOString(),
    author: {
      "@type": "Organization",
      name: entry.data.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Peak PIM",
      url: siteUrl,
      logo: `${siteUrl}/assets/logo/peak-logo-large.png`,
    },
    mainEntityOfPage: url,
    url,
  };

  if (kind === "guides") {
    const guide = entry as GuideEntry;

    return {
      ...base,
      "@type": "HowTo",
      name: guide.data.title,
      step: guide.data.steps.map((step, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: step,
      })),
    };
  }

  return base;
}

function byPublishDateDesc(left: ContentEntry, right: ContentEntry) {
  return right.data.publishDate.getTime() - left.data.publishDate.getTime();
}
