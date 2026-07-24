import { pageSlugs } from "../data/pages";
import { entryUrl, getPublishedArticles, getPublishedGuides } from "../lib/content";
import { canonicalUrl } from "../lib/site-url";

export const prerender = true;

export async function GET() {
  const [articles, guides] = await Promise.all([getPublishedArticles(), getPublishedGuides()]);
  const staticUrls = pageSlugs.filter((slug) => slug !== "partners").map((slug) => canonicalUrl(slug));
  const articleUrls = articles.map((entry) => entryUrl("articles", entry));
  const guideUrls = guides.map((entry) => entryUrl("guides", entry));
  const designSystemPageUrls = [canonicalUrl("shopify-pim-translations")];
  const urls = [...staticUrls, ...designSystemPageUrls, ...articleUrls, ...guideUrls];
  const lastModified = new Date().toISOString().slice(0, 10);

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc><lastmod>${lastModified}</lastmod></url>`).join("\n")}
</urlset>
`;

  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
    },
  });
}
