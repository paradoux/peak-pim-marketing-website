import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export const pages: Record<string, string> = {
  "": "index.html",
  "1-click-setup": "1-click-setup.html",
  "bulk-edit": "bulk-edit.html",
  "industry/fashion": "industry_fashion.html",
  "legals/privacy": "legals_privacy.html",
  mission: "mission.html",
  pricing: "pricing.html",
  "replace-your-shopify-app-stack": "replace-your-shopify-app-stack.html",
  "shopify-media-management": "shopify-media-management.html",
  "shopify-multi-store-pim": "shopify-multi-store-pim.html",
  "shopify-pim-alternatives": "shopify-pim-alternatives.html",
  "shopify-sync": "shopify-sync.html",
  "vs/akeneo": "vs_akeneo.html",
  "vs/catsy": "vs_catsy.html",
  "vs/plytix": "vs_plytix.html",
  "vs/quable": "vs_quable.html",
  "vs/shopify-admin": "vs_shopify-admin.html",
};

export const pageSlugs = Object.keys(pages);

export async function readRecreatedPage(slug: string) {
  const fileName = pages[slug];

  if (!fileName) {
    return null;
  }

  return readFile(resolve(process.cwd(), "reference/local-html", fileName), "utf8");
}
