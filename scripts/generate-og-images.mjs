import { readFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = resolve(projectRoot, "public/assets/og");

const featurePages = [
  { slug: "ai-assistant", title: "AI Assistant", detail: "Catalog answers, approved drafts, and separately confirmed publishing" },
  { slug: "history", title: "Catalog History", detail: "Every saved edit and published change, with before and after" },
  { slug: "search", title: "Global Search", detail: "Every catalog record and app page, one keystroke away" },
  { slug: "ai-catalog-connector", title: "AI Connector (MCP)", detail: "Controlled catalog work from MCP-compatible AI assistants" },
  { slug: "api", title: "Developer API", detail: "One API for every Shopify catalog workflow" },
  { slug: "shopify-catalog-health-center", title: "Catalog Health Center", detail: "Find and fix catalog issues across every store" },
  { slug: "shopify-collections", title: "Collections Management", detail: "Connected merchandising across Shopify stores" },
  { slug: "shopify-custom-fields", title: "Custom Fields", detail: "Structured product data for every workflow" },
  { slug: "shopify-markets-pricing", title: "Markets & Catalog Pricing", detail: "International availability and pricing in one view" },
  { slug: "shopify-metafield-management", title: "Metafield Management", detail: "Typed Shopify data across every store" },
  { slug: "shopify-metaobjects", title: "Metaobjects Management", detail: "Reusable structured content, managed centrally" },
  { slug: "shopify-pim-translations", title: "Product Translations", detail: "Every language beside the source catalog" },
  { slug: "shopify-product-drops", title: "Drops", detail: "Schedule catalog changes and automatic rollbacks" },
  { slug: "shopify-product-import-export", title: "Product Import & Export", detail: "Safe spreadsheet workflows for the whole catalog" },
  { slug: "shopify-product-management", title: "Products & Variants", detail: "One connected product model for every store" },
  { slug: "user-roles-permissions", title: "Users & Permissions", detail: "Clear catalog access for every teammate" },
];

const logo = readFileSync(resolve(projectRoot, "public/assets/logo/peak-logo-large.png")).toString("base64");
const maeliLogo = readFileSync(resolve(projectRoot, "public/mirror/6a02fa863eea804db7dc36f9_Maeli-Black-logo-138c12bb52.png")).toString("base64");
const ameliePortrait = readFileSync(resolve(projectRoot, "public/assets/testimonials/amelie-samson-maeli-paris.webp")).toString("base64");
const spaceGrotesk = readFileSync(resolve(projectRoot, "public/mirror/fonts/V8mDoQDjQSkFtoMM3T6r8E7mPbF4Cw-4ecc7e89b7.woff2")).toString("base64");
const inter = readFileSync(resolve(projectRoot, "public/mirror/fonts/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7-6ab57b19c6.woff2")).toString("base64");

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function template(feature) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <style>
      @font-face { font-family: "Space Grotesk"; src: url(data:font/woff2;base64,${spaceGrotesk}) format("woff2"); font-weight: 300 700; }
      @font-face { font-family: "Inter"; src: url(data:font/woff2;base64,${inter}) format("woff2"); font-weight: 300 700; }
      * { box-sizing: border-box; }
      html, body { width: 1200px; height: 630px; margin: 0; overflow: hidden; }
      body { background: #f5f1e9; color: #181818; font-family: "Inter", sans-serif; }
      .canvas { position: relative; display: grid; grid-template-columns: 1.05fr .95fr; width: 100%; height: 100%; padding: 58px 58px 52px; overflow: hidden; }
      .canvas::before { content: ""; position: absolute; inset: 0; background-image: radial-gradient(#d8d2c7 1.2px, transparent 1.2px); background-size: 22px 22px; opacity: .34; mask-image: linear-gradient(90deg, transparent 0%, #000 67%, #000 100%); }
      .copy { position: relative; z-index: 2; display: flex; flex-direction: column; min-width: 0; }
      .logo { width: 205px; height: auto; object-fit: contain; object-position: left center; }
      .eyebrow { margin-top: auto; margin-bottom: 18px; color: #2456d7; font-size: 20px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
      h1 { max-width: 610px; margin: 0; font-family: "Space Grotesk", sans-serif; font-size: 68px; font-weight: 600; letter-spacing: -.045em; line-height: .98; text-wrap: balance; }
      p { max-width: 560px; margin: 24px 0 0; font-size: 24px; line-height: 1.34; color: #494743; text-wrap: balance; }
      .visual { position: relative; z-index: 2; align-self: center; margin-left: 36px; }
      .window { position: relative; width: 100%; height: 440px; border: 1px solid #c9c5bd; border-radius: 20px; background: rgba(255,255,255,.91); box-shadow: 0 24px 70px rgba(32,29,24,.12); overflow: hidden; }
      .window-bar { display: flex; align-items: center; gap: 8px; height: 52px; padding: 0 18px; border-bottom: 1px solid #dad7d1; background: #1b1b1b; }
      .window-bar i { display: block; width: 9px; height: 9px; border-radius: 50%; background: #777; }
      .workspace { display: grid; grid-template-columns: 64px 1fr; height: calc(100% - 52px); }
      .rail { padding: 20px 14px; background: #2456d7; }
      .rail span { display: block; width: 34px; height: 34px; margin-bottom: 14px; border: 1px solid rgba(255,255,255,.4); border-radius: 8px; }
      .rail span:first-child { background: #fff; }
      .table { padding: 25px 24px; }
      .table-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
      .table-head strong { font-size: 20px; }
      .table-head b { padding: 8px 12px; border-radius: 7px; background: #1b1b1b; color: white; font-size: 12px; letter-spacing: .03em; }
      .row { display: grid; grid-template-columns: 34px 1.3fr .9fr 56px; align-items: center; gap: 13px; height: 58px; border-top: 1px solid #e2dfd9; }
      .row .check { width: 16px; height: 16px; border: 1px solid #cbc7bf; border-radius: 3px; }
      .row .line { height: 8px; border-radius: 999px; background: #d8d5ce; }
      .row .line.short { width: 72%; background: #dfe5ff; }
      .row .state { padding: 6px 8px; border-radius: 999px; background: #e4f2e8; color: #2d7540; font-size: 10px; font-weight: 700; text-align: center; }
      .row.active { margin: 0 -12px; padding: 0 12px; border-top-color: transparent; border-radius: 9px; background: #eef1ff; }
      .accent { position: absolute; right: -62px; bottom: -62px; width: 178px; height: 178px; border: 34px solid rgba(36,86,215,.12); border-radius: 50%; }
    </style>
  </head>
  <body>
    <main class="canvas">
      <section class="copy">
        <img class="logo" src="data:image/png;base64,${logo}" alt="">
        <div class="eyebrow">Shopify-native PIM</div>
        <h1>${escapeHtml(feature.title)}</h1>
        <p>${escapeHtml(feature.detail)}</p>
      </section>
      <section class="visual" aria-hidden="true">
        <div class="window">
          <div class="window-bar"><i></i><i></i><i></i></div>
          <div class="workspace">
            <div class="rail"><span></span><span></span><span></span><span></span><span></span></div>
            <div class="table">
              <div class="table-head"><strong>Peak workspace</strong><b>READY</b></div>
              <div class="row"><span class="check"></span><span class="line"></span><span class="line short"></span><span class="state">Synced</span></div>
              <div class="row active"><span class="check"></span><span class="line"></span><span class="line short"></span><span class="state">Ready</span></div>
              <div class="row"><span class="check"></span><span class="line"></span><span class="line short"></span><span class="state">Synced</span></div>
              <div class="row"><span class="check"></span><span class="line"></span><span class="line short"></span><span class="state">Ready</span></div>
              <div class="row"><span class="check"></span><span class="line"></span><span class="line short"></span><span class="state">Synced</span></div>
            </div>
          </div>
        </div>
      </section>
      <div class="accent"></div>
    </main>
  </body>
</html>`;
}

function customerStoryTemplate() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <style>
      @font-face { font-family: "Space Grotesk"; src: url(data:font/woff2;base64,${spaceGrotesk}) format("woff2"); font-weight: 300 700; }
      @font-face { font-family: "Inter"; src: url(data:font/woff2;base64,${inter}) format("woff2"); font-weight: 300 700; }
      * { box-sizing: border-box; }
      html, body { width: 1200px; height: 630px; margin: 0; overflow: hidden; }
      body { background: #f5f1e9; color: #181818; font-family: "Inter", sans-serif; }
      main { display: grid; width: 100%; height: 100%; grid-template-columns: 1.1fr .9fr; }
      .copy { display: flex; padding: 52px 58px 48px; flex-direction: column; }
      .peak { width: 190px; height: auto; object-fit: contain; object-position: left center; }
      .customer { width: 150px; height: 66px; margin-top: auto; object-fit: contain; object-position: left center; }
      .eyebrow { margin: 22px 0 16px; color: #2845d6; font-size: 18px; font-weight: 750; letter-spacing: .09em; text-transform: uppercase; }
      h1 { max-width: 650px; margin: 0; font-family: "Space Grotesk", sans-serif; font-size: 64px; font-weight: 600; letter-spacing: -.05em; line-height: .98; text-wrap: balance; }
      p { max-width: 610px; margin: 22px 0 0; color: #54514c; font-size: 22px; line-height: 1.35; text-wrap: balance; }
      .portrait { position: relative; min-width: 0; overflow: hidden; }
      .portrait::after { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(245,241,233,.18), transparent 22%); content: ""; }
      .portrait img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 27%; }
      .caption { position: absolute; right: 28px; bottom: 28px; z-index: 2; padding: 11px 15px; border-radius: 999px; background: rgba(24,24,24,.84); color: white; font-size: 14px; backdrop-filter: blur(8px); }
    </style>
  </head>
  <body>
    <main>
      <section class="copy">
        <img class="peak" src="data:image/png;base64,${logo}" alt="">
        <img class="customer" src="data:image/png;base64,${maeliLogo}" alt="">
        <div class="eyebrow">Customer story</div>
        <h1>How Maéli Paris gets hours back every week</h1>
        <p>One-afternoon setup, scheduled fabric Drops, and one multilingual product workflow.</p>
      </section>
      <section class="portrait">
        <img src="data:image/webp;base64,${ameliePortrait}" alt="">
        <span class="caption">Amélie Samson · Maéli Paris</span>
      </section>
    </main>
  </body>
</html>`;
}

mkdirSync(outputDirectory, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });

for (const feature of featurePages) {
  await page.setContent(template(feature), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: resolve(outputDirectory, `${feature.slug}.png`), type: "png" });
}

await page.setContent(customerStoryTemplate(), { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: resolve(outputDirectory, "maeli-paris-customer-story.png"), type: "png" });

await browser.close();
console.log(`Generated ${featurePages.length + 1} Open Graph images in public/assets/og.`);
