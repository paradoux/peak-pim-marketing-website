import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const failures = [];

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(directory, entry.name)) : [join(directory, entry.name)],
  );
}

const pricingFile = resolve(projectRoot, "dist/pricing/index.html");

if (!existsSync(pricingFile)) {
  failures.push("Missing built pricing page; run npm run build first");
} else {
  const html = readFileSync(pricingFile, "utf8");
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ?? "{}");

  if (!html.includes('rel="canonical" href="https://peak-pim.com/pricing/"')) failures.push("Pricing canonical does not match its final 200 URL");
  if (html.includes("unlimited stores")) failures.push("Pricing still contains the outdated unlimited-stores claim");
  if (html.includes("next billing cycle")) failures.push("Pricing schema conflicts with the visible plan-change policy");
  if (!schema.offers?.every((offer) => offer.availability === "https://schema.org/InStock")) failures.push("Pricing schema does not mark every live plan as available");

  for (const fact of [
    "1,500 SKUs, 2 connected Shopify stores, 3 seats, and 100GB files",
    "5,000 SKUs, 3 connected Shopify stores, 15 seats, and 500GB files",
    "Enterprise limits are custom",
  ]) {
    if (!html.includes(fact)) failures.push(`Pricing crawler content is missing: ${fact}`);
  }
}

const distDirectory = resolve(projectRoot, "dist");
if (existsSync(distDirectory)) {
  for (const file of walk(distDirectory).filter((entry) => entry.endsWith(".html"))) {
    const html = readFileSync(file, "utf8");

    for (const match of html.matchAll(/<link rel="canonical" href="([^"]+)"/g)) {
      if (match[1] !== "https://peak-pim.com/" && !match[1].endsWith("/")) {
        failures.push(`${file} has a redirecting canonical URL: ${match[1]}`);
      }
    }
  }
}

const sitemap = readFileSync(resolve(projectRoot, "dist/sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
if (!sitemap.includes("<loc>https://peak-pim.com/pricing/</loc>")) failures.push("Sitemap is missing the direct pricing URL");
if (sitemap.includes("https://peak-pim.com/partners/")) failures.push("Sitemap exposes the unfinished partners page");
if (sitemapUrls.some((url) => url !== "https://peak-pim.com/" && !url.endsWith("/"))) failures.push("Sitemap contains a redirecting URL");
if ((sitemap.match(/<lastmod>/g) ?? []).length !== sitemapUrls.length) failures.push("Sitemap last-modified dates are incomplete");

const robots = readFileSync(resolve(projectRoot, "public/robots.txt"), "utf8");
if (!robots.includes("Allow: /") || !robots.includes("Sitemap: https://peak-pim.com/sitemap.xml")) failures.push("Crawler discovery directives are incomplete");

const llms = readFileSync(resolve(projectRoot, "public/llms.txt"), "utf8");
for (const fact of ["Core: $99 per month or $990 per year", "Elite: $249 per month or $2,490 per year", "Enterprise: Custom pricing", "10-day free trial"]) {
  if (!llms.includes(fact)) failures.push(`llms.txt is missing current pricing guidance: ${fact}`);
}

const redirects = readFileSync(resolve(projectRoot, "public/_redirects"), "utf8");
if (!redirects.includes("/pricing /pricing/ 301")) failures.push("Pricing is missing its crawler-friendly permanent redirect");

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`Crawler contract passed (${sitemapUrls.length} sitemap URLs).`);
