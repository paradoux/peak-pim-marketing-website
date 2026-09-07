import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const tracker = await readFile(new URL("src/components/OpenAIAdsTracking.astro", root), "utf8");
const layouts = ["RecreatedLayout.astro", "LandingPageLayout.astro", "ContentLayout.astro", "ContentIndexLayout.astro"];

assert.match(tracker, /pixelId:\s*"RPxVepoq54b3FTbxBE1QjF"/);
assert.match(tracker, /"message:sent"[\s\S]*"lead_created"/);
assert.match(tracker, /"chat:opened"[\s\S]*custom_event_name:\s*"chat_opened"/);
assert.match(tracker, /apps\.shopify\.com[\s\S]*custom_event_name:\s*"shopify_listing_clicked"/);
assert.match(tracker, /globalPrivacyControl/);

for (const layout of layouts) {
  const source = await readFile(new URL(`src/layouts/${layout}`, root), "utf8");
  assert.match(source, /import OpenAIAdsTracking from "\.\.\/components\/OpenAIAdsTracking\.astro";/);
  assert.match(source, /<head>[\s\S]*<OpenAIAdsTracking \/>/);
}

console.log("Ads conversion tracking contract passed.");
