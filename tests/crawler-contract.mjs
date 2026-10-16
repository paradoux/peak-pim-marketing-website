import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import * as parse5 from "parse5";

const projectRoot = resolve(import.meta.dirname, "..");
const failures = [];

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(directory, entry.name)) : [join(directory, entry.name)],
  );
}

function attribute(node, name) {
  return node.attrs?.find((entry) => entry.name === name)?.value ?? "";
}

function hasAttribute(node, name) {
  return node.attrs?.some((entry) => entry.name === name) ?? false;
}

function isHidden(node) {
  return attribute(node, "aria-hidden") === "true" || hasAttribute(node, "hidden") || hasAttribute(node, "inert");
}

function accessibleText(node) {
  if (!node || isHidden(node) || ["script", "style", "template"].includes(node.tagName)) return "";
  if (node.nodeName === "#text") return node.value ?? "";
  if (node.tagName === "img") return attribute(node, "alt");
  return (node.childNodes ?? []).map(accessibleText).join(" ");
}

function normalizeText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function visibleUnnamedLinks(html) {
  const document = parse5.parse(html);
  const elementsById = new Map();
  const visibleLinks = [];

  function collect(node, ancestorIsHidden = false) {
    const nodeIsHidden = ancestorIsHidden || isHidden(node);
    const id = attribute(node, "id");
    if (id) elementsById.set(id, node);
    if (node.tagName === "a" && attribute(node, "href") && !nodeIsHidden) visibleLinks.push(node);
    for (const child of node.childNodes ?? []) collect(child, nodeIsHidden);
  }

  collect(document);

  return visibleLinks.filter((link) => {
    let name = normalizeText(attribute(link, "aria-label")) || normalizeText(attribute(link, "title"));
    if (!name) {
      name = normalizeText(
        attribute(link, "aria-labelledby")
          .split(/\s+/)
          .filter(Boolean)
          .map((id) => accessibleText(elementsById.get(id)))
          .join(" "),
      );
    }
    if (!name) name = normalizeText(accessibleText(link));
    return !name;
  });
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
  if (schema.featureList?.length !== 38) failures.push("Pricing schema feature list is incomplete");
  if (!schema.offers?.every((offer) => offer.additionalProperty?.length === 38)) failures.push("Pricing offers do not expose the complete feature matrix");

  const schemaFeatureValue = (planName, featureName) => schema.offers
    ?.find((offer) => offer.name === planName)
    ?.additionalProperty?.find((property) => property.name === featureName)?.value;

  for (const [planName, featureName, expectedValue] of [
    ["Core", "Monthly updates", "10,000"],
    ["Core", "Seats", "2"],
    ["Elite", "Seats", "5"],
    ["Enterprise", "Seats", "Custom"],
    ["Core", "SKUs", "5,000"],
    ["Elite", "SKUs", "Unlimited, fair usage"],
    ["Core", "Connected Shopify stores", "1"],
    ["Elite", "Connected Shopify stores", "2"],
    ["Enterprise", "Connected Shopify stores", "Custom"],
    ["Core", "Multi-store management", "Not included"],
    ["Elite", "Multi-store management", "Included"],
    ["Core", "Drops", "2 per month"],
    ["Elite", "Drops", "Unlimited"],
    ["Enterprise", "Translations", "Included"],
    ["Elite", "Custom fields", "Included"],
    ["Core", "Amazon sync", "Coming soon"],
    ["Enterprise", "Automations", "Coming soon"],
    ["Core", "Scores", "Coming soon"],
    ["Core", "AI Assistant", "Included"],
    ["Elite", "History", "Included"],
    ["Core", "Backups", "Coming soon"],
    ["Enterprise", "Global search", "Included"],
    ["Enterprise", "CMS", "On request"],
  ]) {
    if (schemaFeatureValue(planName, featureName) !== expectedValue) failures.push(`Pricing schema has an incorrect ${planName} value for ${featureName}`);
  }

  for (const fact of [
    "Core is $99/month or $990/year",
    "Elite is $249/month or $2,490/year",
    "SKUs and file storage follow fair usage",
  ]) {
    if (!html.includes(fact)) failures.push(`Pricing crawler content is missing: ${fact}`);
  }
}

const distDirectory = resolve(projectRoot, "dist");
if (existsSync(distDirectory)) {
  for (const file of walk(distDirectory).filter((entry) => entry.endsWith(".html"))) {
    const html = readFileSync(file, "utf8");

    for (const stalePricingClaim of [
      "Peak PIM starts at $49",
      "from $49 a month",
      "$49/mo vs",
      "From $49/mo",
      "starts with the Basic plan",
      "Up to 1,500 SKUs",
      "Core includes 3 seats",
      "Elite includes 15 seats",
      "Core: 3 seats",
      "Core supports 2",
      "Elite supports 3",
      "Core includes 2 connected Shopify stores",
      "Core includes 2,",
      "Elite includes 3",
      "100GB files",
      "500GB files",
    ]) {
      if (html.includes(stalePricingClaim)) failures.push(`${file} contains outdated pricing guidance: ${stalePricingClaim}`);
    }

    if (html.includes('class="layout401_card pricing-plan-card')) {
      const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ?? "{}");
      if (schema.offers?.map((offer) => offer.name).join(",") !== "Core,Elite,Enterprise") {
        failures.push(`${file} must expose only Core, Elite, and Enterprise`);
      }
      const core = schema.offers?.[0];
      if (core?.price !== "99" || core?.additionalProperty?.[2]?.value !== "10,000" || core?.additionalProperty?.[3]?.value !== "5,000") {
        failures.push(`${file} must start at $99 with 10,000 monthly updates and 5,000 SKUs`);
      }
    }

    for (const match of html.matchAll(/<link rel="canonical" href="([^"]+)"/g)) {
      if (match[1] !== "https://peak-pim.com/" && !match[1].endsWith("/")) {
        failures.push(`${file} has a redirecting canonical URL: ${match[1]}`);
      }
    }

    for (const link of visibleUnnamedLinks(html)) {
      const route = relative(distDirectory, file).replaceAll("\\", "/").replace(/(^|\/)index\.html$/, "$1") || "/";
      failures.push(`${route} has a visible link without a discernible name: ${attribute(link, "href")}`);
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
if (!sitemap.includes("<loc>https://peak-pim.com/fr/traductions-produits-shopify/</loc>")) failures.push("Sitemap is missing the French translations URL");
if (!sitemap.includes("<loc>https://peak-pim.com/customers/maeli-paris/</loc>")) failures.push("Sitemap is missing the Maéli Paris customer story URL");
if (!sitemap.includes("<loc>https://peak-pim.com/customers/carre-coco/</loc>")) failures.push("Sitemap is missing the Carré Coco customer story URL");
if (!sitemap.includes("<loc>https://peak-pim.com/customers/house-of-staunton/</loc>")) failures.push("Sitemap is missing the House of Staunton customer use case URL");
if (!sitemap.includes("<loc>https://peak-pim.com/customers/du-bruit-dans-la-cuisine/</loc>")) failures.push("Sitemap is missing the Du Bruit dans la Cuisine customer story URL");
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
if (!llms.includes("[How House of Staunton manages three Shopify stores with Peak PIM](https://peak-pim.com/customers/house-of-staunton/)")) failures.push("llms.txt is missing the House of Staunton customer use case");
if (!llms.includes("[How Du Bruit dans la Cuisine centralizes product content with Peak PIM](https://peak-pim.com/customers/du-bruit-dans-la-cuisine/)")) failures.push("llms.txt is missing the Du Bruit dans la Cuisine customer story");
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
for (const fact of ["Core: $99 per month or $990 per year", "10,000 monthly updates", "Elite: $249 per month or $2,490 per year", "unlimited monthly updates", "Elite includes unlimited SKUs under fair usage", "Core and Elite include unlimited file storage under fair usage", "Enterprise: Custom pricing", "10-day free trial"]) {
  if (!llms.includes(fact)) failures.push(`llms.txt is missing current pricing guidance: ${fact}`);
}

const redirects = readFileSync(resolve(projectRoot, "public/_redirects"), "utf8");
if (!redirects.includes("/pricing /pricing/ 301")) failures.push("Pricing is missing its crawler-friendly permanent redirect");

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`Crawler contract passed (${sitemapUrls.length} sitemap URLs).`);
