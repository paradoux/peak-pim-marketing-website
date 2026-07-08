import { pageSlugs } from "../data/pages";

export const prerender = true;

export function GET() {
  const urls = pageSlugs
    .map((slug) => `https://peak-pim.com/${slug}`)
    .map((url) => url.replace(/\/$/, "/"));

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
