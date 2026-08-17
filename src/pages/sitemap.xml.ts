import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { pages } from "../data/pages";
import { entryUrl, getPublishedArticles, getPublishedGuides } from "../lib/content";
import { defaultLocale, getLocaleAlternates, localizedRoutes, translatedLocales } from "../i18n/config";
import { canonicalUrl } from "../lib/site-url";

export const prerender = true;

const projectRoot = process.cwd();
const fallbackDate = new Date().toISOString().slice(0, 10);

function sourceLastModified(relativePath: string) {
  try {
    const date = execFileSync("git", ["log", "-1", "--format=%cs", "--", relativePath], {
      cwd: projectRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  } catch {
    // Fall back to the source file timestamp when Git metadata is unavailable.
  }

  const sourcePath = resolve(projectRoot, relativePath);
  return existsSync(sourcePath) ? statSync(sourcePath).mtime.toISOString().slice(0, 10) : fallbackDate;
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function sitemapAlternateLinks(url: string) {
  const alternates = getLocaleAlternates(new URL(url).pathname);
  const defaultAlternate = alternates.find((alternate) => alternate.locale === defaultLocale);

  return [
    ...alternates.map((alternate) => ({ hreflang: alternate.hreflang, href: alternate.url })),
    ...(defaultAlternate ? [{ hreflang: "x-default", href: defaultAlternate.url }] : []),
  ];
}

export async function GET() {
  const [articles, guides] = await Promise.all([getPublishedArticles(), getPublishedGuides()]);
  const staticEntries = pages
    .filter((page) => page.slug !== "partners")
    .map((page) => ({
      url: canonicalUrl(page.slug),
      lastModified: sourceLastModified(`src/content/recreated-pages/${page.source}`),
    }));
  const collectionIndexEntries = [
    { slug: "blog", source: "src/pages/blog/index.astro" },
    { slug: "guides", source: "src/pages/guides/index.astro" },
  ].map((page) => ({ url: canonicalUrl(page.slug), lastModified: sourceLastModified(page.source) }));
  const designSystemPages = [
    "ai-assistant",
    "history",
    "search",
    "shopify-pim-translations",
    "shopify-product-import-export",
    "shopify-product-drops",
    "shopify-catalog-health-center",
    "ai-catalog-connector",
    "api",
    "shopify-metaobjects",
    "shopify-collections",
    "shopify-markets-pricing",
    "shopify-product-management",
    "shopify-metafield-management",
    "shopify-custom-fields",
    "user-roles-permissions",
    "build-vs-buy-pim",
  ];
  const designSystemEntries = designSystemPages.map((slug) => ({
    url: canonicalUrl(slug),
    lastModified: sourceLastModified(`src/pages/${slug}.astro`),
  }));
  const customerStoryEntries = [
    { slug: "customers/maeli-paris", source: "src/pages/customers/maeli-paris.astro" },
    { slug: "customers/carre-coco", source: "src/pages/customers/carre-coco.astro" },
  ].map((page) => ({ url: canonicalUrl(page.slug), lastModified: sourceLastModified(page.source) }));
  const articleEntries = articles.map((entry) => ({
    url: entryUrl("articles", entry),
    lastModified: isoDate(entry.data.updatedDate ?? entry.data.publishDate),
  }));
  const guideEntries = guides.map((entry) => ({
    url: entryUrl("guides", entry),
    lastModified: isoDate(entry.data.updatedDate ?? entry.data.publishDate),
  }));
  const englishEntries = [...staticEntries, ...collectionIndexEntries, ...designSystemEntries, ...customerStoryEntries, ...articleEntries, ...guideEntries];
  const localizedEntries = localizedRoutes.flatMap((route) => {
    const englishEntry = englishEntries.find((entry) => entry.url === canonicalUrl(route.paths.en));
    if (!englishEntry) throw new Error(`Missing English sitemap source for localized route: ${route.key}`);
    return translatedLocales.map((locale) => ({ url: canonicalUrl(route.paths[locale]), lastModified: englishEntry.lastModified }));
  });
  const entries = [...englishEntries, ...localizedEntries];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.map(({ url, lastModified }) => {
    const alternateLinks = sitemapAlternateLinks(url);
    return `  <url><loc>${url}</loc><lastmod>${lastModified}</lastmod>${alternateLinks.map((alternate) => `<xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${alternate.href}" />`).join("")}</url>`;
  }).join("\n")}
</urlset>
`;

  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
    },
  });
}
