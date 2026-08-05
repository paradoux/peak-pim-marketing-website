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
  if (schema.featureList?.length !== 34) failures.push("Pricing schema feature list is incomplete");
  if (!schema.offers?.every((offer) => offer.additionalProperty?.length === 34)) failures.push("Pricing offers do not expose the complete feature matrix");

  const schemaFeatureValue = (planName, featureName) => schema.offers
    ?.find((offer) => offer.name === planName)
    ?.additionalProperty?.find((property) => property.name === featureName)?.value;

  for (const [planName, featureName, expectedValue] of [
    ["Core", "Drops", "Not included"],
    ["Elite", "Drops", "Included"],
    ["Enterprise", "Translations", "Included"],
    ["Elite", "Custom fields", "Included"],
    ["Core", "Amazon sync", "Coming soon"],
    ["Enterprise", "Automations", "Coming soon"],
    ["Core", "Scores", "Coming soon"],
    ["Core", "AI Assistant", "Included"],
    ["Elite", "History", "Included"],
    ["Core", "Backups", "Coming soon"],
    ["Enterprise", "Global search", "Included"],
  ]) {
    if (schemaFeatureValue(planName, featureName) !== expectedValue) failures.push(`Pricing schema has an incorrect ${planName} value for ${featureName}`);
  }

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
if (!sitemap.includes("<loc>https://peak-pim.com/blog/</loc>")) failures.push("Sitemap is missing the article index URL");
if (!sitemap.includes("<loc>https://peak-pim.com/guides/</loc>")) failures.push("Sitemap is missing the guide index URL");
if (!sitemap.includes("<loc>https://peak-pim.com/history/</loc>")) failures.push("Sitemap is missing the History URL");
if (!sitemap.includes("<loc>https://peak-pim.com/search/</loc>")) failures.push("Sitemap is missing the Global Search URL");
if (!sitemap.includes("<loc>https://peak-pim.com/ai-assistant/</loc>")) failures.push("Sitemap is missing the AI Assistant URL");
if (!sitemap.includes("<loc>https://peak-pim.com/customers/maeli-paris/</loc>")) failures.push("Sitemap is missing the Maéli Paris customer story URL");
if (!sitemap.includes("<loc>https://peak-pim.com/customers/carre-coco/</loc>")) failures.push("Sitemap is missing the Carré Coco customer story URL");
if (sitemap.includes("https://peak-pim.com/partners/")) failures.push("Sitemap exposes the unfinished partners page");
if (sitemapUrls.some((url) => url !== "https://peak-pim.com/" && !url.endsWith("/"))) failures.push("Sitemap contains a redirecting URL");
if ((sitemap.match(/<lastmod>/g) ?? []).length !== sitemapUrls.length) failures.push("Sitemap last-modified dates are incomplete");

const robots = readFileSync(resolve(projectRoot, "public/robots.txt"), "utf8");
if (!robots.includes("Allow: /") || !robots.includes("Sitemap: https://peak-pim.com/sitemap.xml")) failures.push("Crawler discovery directives are incomplete");

const llms = readFileSync(resolve(projectRoot, "public/llms.txt"), "utf8");
if (!llms.includes("[Shopify catalog change history](https://peak-pim.com/history/)")) failures.push("llms.txt is missing the History page");
if (!llms.includes("[Global Search for Shopify catalogs](https://peak-pim.com/search/)")) failures.push("llms.txt is missing the Global Search page");
if (!llms.includes("[AI Assistant for Shopify catalog management](https://peak-pim.com/ai-assistant/)")) failures.push("llms.txt is missing the AI Assistant page");
if (!llms.includes("[How Maéli Paris saves hours every week with Peak PIM](https://peak-pim.com/customers/maeli-paris/)")) failures.push("llms.txt is missing the Maéli Paris customer story");
if (!llms.includes("[How Carré Coco manages B2B and B2C catalogs with Peak PIM](https://peak-pim.com/customers/carre-coco/)")) failures.push("llms.txt is missing the Carré Coco customer story");
if (!llms.includes("[Built to last: Peak PIM's mission](https://peak-pim.com/mission/)")) failures.push("llms.txt is missing Peak PIM's long-term company story");

const missionFile = resolve(projectRoot, "dist/mission/index.html");
if (!existsSync(missionFile)) {
  failures.push("Missing built Mission page");
} else {
  const html = readFileSync(missionFile, "utf8");
  for (const fact of [
    "We are on a mission",
    "All this time lost managing product chaos",
    "give every Shopify merchant full control over their product data",
    "SyncBase",
    "world’s leading integration between Shopify and Airtable",
    "Peak PIM is profitable",
    "next decade and beyond",
  ]) {
    if (!html.includes(fact)) failures.push(`Mission page is missing long-term trust proof: ${fact}`);
  }
  if (!html.includes('class="mission-founder-photo"') || !html.includes("peak-pim-founders-tech-for-retail.jpg")) failures.push("Mission page is missing the founders' shared photo");
  if (!html.includes('rel="canonical" href="https://peak-pim.com/mission/"')) failures.push("Mission canonical URL is incorrect");
  if (!html.includes('"url": "https://peak-pim.com/mission/"')) failures.push("Mission structured-data URL is not canonical");
  if (html.includes("<title>Our Mission | Peak PIM</title>")) failures.push("Mission page still contains its retired metadata title");
}
if ((llms.match(/^## Current Pricing$/gm) ?? []).length !== 1) failures.push("llms.txt must contain exactly one Current Pricing section");
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
