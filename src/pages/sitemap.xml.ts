import { pageSlugs } from "../data/pages";
import { entryUrl, getPublishedArticles, getPublishedGuides } from "../lib/content";

export const prerender = true;

export async function GET() {
  const [articles, guides] = await Promise.all([getPublishedArticles(), getPublishedGuides()]);
  const staticUrls = pageSlugs
    .map((slug) => `https://peak-pim.com/${slug}`)
    .map((url) => url.replace(/\/$/, "/"));
  const articleUrls = articles.map((entry) => entryUrl("articles", entry));
  const guideUrls = guides.map((entry) => entryUrl("guides", entry));
  const designSystemPageUrls = ["https://peak-pim.com/shopify-pim-translations"];
  const urls = [...staticUrls, ...designSystemPageUrls, ...articleUrls, ...guideUrls];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc></url>`).join("\n")}
</urlset>
`;

  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
    },
  });
}
