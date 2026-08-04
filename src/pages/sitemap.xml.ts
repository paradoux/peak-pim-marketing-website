import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { pages } from "../data/pages";
import { entryUrl, getPublishedArticles, getPublishedGuides } from "../lib/content";
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
  ].map((page) => ({ url: canonicalUrl(page.slug), lastModified: sourceLastModified(page.source) }));
  const articleEntries = articles.map((entry) => ({
    url: entryUrl("articles", entry),
    lastModified: isoDate(entry.data.updatedDate ?? entry.data.publishDate),
  }));
  const guideEntries = guides.map((entry) => ({
    url: entryUrl("guides", entry),
    lastModified: isoDate(entry.data.updatedDate ?? entry.data.publishDate),
  }));
  const entries = [...staticEntries, ...collectionIndexEntries, ...designSystemEntries, ...customerStoryEntries, ...articleEntries, ...guideEntries];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(({ url, lastModified }) => `  <url><loc>${url}</loc><lastmod>${lastModified}</lastmod></url>`).join("\n")}
</urlset>
`;

  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
    },
  });
}
