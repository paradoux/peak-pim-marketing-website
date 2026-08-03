import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const requiredFiles = [
  "scripts/generate-og-images.mjs",
  "src/layouts/LandingPageLayout.astro",
  "src/lib/site-url.ts",
  "src/data/cta-copy.ts",
  "src/data/pricing-feature-matrix.ts",
  "src/data/site-navigation.ts",
  "src/components/ui/Button.astro",
  "src/components/ui/PeakIcon.astro",
  "src/components/ui/ProductVisualFrame.astro",
  "src/components/ui/SectionHeading.astro",
  "src/components/sections/Hero.astro",
  "src/components/sections/LogoCloud.astro",
  "src/components/sections/ProblemGrid.astro",
  "src/components/sections/CardGrid.astro",
  "src/components/sections/FeatureSteps.astro",
  "src/components/sections/FeatureGrid.astro",
  "src/components/sections/Testimonial.astro",
  "src/components/sections/CtaBanner.astro",
  "src/components/sections/ComparisonHero.astro",
  "src/components/sections/ComparisonVerdict.astro",
  "src/components/sections/ComparisonTable.astro",
  "src/components/sections/PricingComparison.astro",
  "src/components/sections/DecisionGuide.astro",
  "src/components/sections/Faq.astro",
  "src/components/visuals/TranslationWorkflowDemo.astro",
  "src/components/visuals/TranslationStepVisual.astro",
  "src/components/visuals/TranslationsHeroVisual.astro",
  "src/components/visuals/TranslationsCardVisual.astro",
  "src/components/visuals/BuildVsBuyHeroVisual.astro",
  "public/assets/marketing/build-vs-buy-maintenance-example.webp",
  "src/components/visuals/BuildVsBuyDecisionVisual.astro",
  "src/components/visuals/ImportExportHeroVisual.astro",
  "src/components/visuals/ImportExportCardVisual.astro",
  "src/components/visuals/DropsHeroVisual.astro",
  "src/components/visuals/DropsCardVisual.astro",
  "src/components/visuals/HealthCenterHeroVisual.astro",
  "src/components/visuals/HealthCenterCardVisual.astro",
  "src/components/visuals/AiConnectorHeroVisual.astro",
  "src/components/visuals/AiConnectorCardVisual.astro",
  "src/components/visuals/DeveloperApiHeroVisual.astro",
  "src/components/visuals/DeveloperApiCardVisual.astro",
  "src/components/visuals/MetaobjectsHeroVisual.astro",
  "src/components/visuals/MetaobjectsCardVisual.astro",
  "src/components/visuals/MetafieldsHeroVisual.astro",
  "src/components/visuals/MetafieldsCardVisual.astro",
  "src/components/visuals/CustomFieldsHeroVisual.astro",
  "src/components/visuals/CustomFieldsCardVisual.astro",
  "src/components/visuals/RolesPermissionsHeroVisual.astro",
  "src/components/visuals/RolesPermissionsCardVisual.astro",
  "src/components/visuals/CollectionsHeroVisual.astro",
  "src/components/visuals/CollectionsCardVisual.astro",
  "src/components/visuals/MarketsCatalogsHeroVisual.astro",
  "src/components/visuals/MarketsCatalogsCardVisual.astro",
  "src/components/visuals/ProductsVariantsHeroVisual.astro",
  "src/components/visuals/ProductsVariantsCardVisual.astro",
  "src/pages/design-system.astro",
  "src/pages/shopify-pim-translations.astro",
  "src/pages/shopify-product-import-export.astro",
  "src/pages/shopify-product-drops.astro",
  "src/pages/shopify-catalog-health-center.astro",
  "src/pages/ai-catalog-connector.astro",
  "src/pages/api.astro",
  "src/pages/shopify-metaobjects.astro",
  "src/pages/shopify-metafield-management.astro",
  "src/pages/shopify-custom-fields.astro",
  "src/pages/user-roles-permissions.astro",
  "src/pages/shopify-collections.astro",
  "src/pages/shopify-markets-pricing.astro",
  "src/pages/shopify-product-management.astro",
  "src/pages/build-vs-buy-pim.astro",
  "public/og-build-vs-buy-pim.png",
  "docs/copywriting-system.md",
  "skills/peak-landing-pages/SKILL.md",
];

const failures = [];
for (const file of requiredFiles) {
  if (!existsSync(resolve(projectRoot, file))) failures.push(`Missing ${file}`);
}

const canonicalContracts = {
  "src/components/ui/ProductVisualFrame.astro": ["peak-product-window", "peak-product-window__topbar", "peak-product-window__body", "role=\"img\""],
  "src/components/sections/Hero.astro": ["peak-hero", "peak-hero__component", "peak-hero__visual", "section_header26", "header26_component", "heading-style-h1", "button-group is-center"],
  "src/components/sections/LogoCloud.astro": ["peak-logo-cloud", "peak-logo-cloud__component", "peak-logo-cloud__list", "peak-logo-cloud__item", "section_logo2", "heading-style-h6", "logo2_component", "logo2_logo-list", "getSharedLogoBannerHtml"],
  "src/components/sections/ProblemGrid.astro": ["peak-problem-grid", "peak-problem-grid__component", "peak-problem-grid__list", "peak-problem-grid__item", "section_layout237", "layout237_list", "heading-style-h4"],
  "src/components/sections/CardGrid.astro": ["peak-card-grid", "peak-card-grid__component", "peak-card-grid__list", "peak-card-grid__card", "section_layout395", "layout395_grid-list", "layout395_row", "layout395_card", "layout395_card-image-wrapper", "layout395_card-content", "heading-style-h4"],
  "src/components/sections/FeatureSteps.astro": ["peak-feature-steps", "peak-feature-steps__component", "peak-feature-steps__list", "peak-feature-steps__item", "section_layout239", "layout239_list", "layout239_image-wrapper", "heading-style-h4"],
  "src/components/sections/FeatureGrid.astro": ["peak-feature-grid", "peak-feature-grid__component", "peak-feature-grid__list", "peak-feature-grid__card", "section_layout353", "layout353_component", "features.length !== 4", "content-item-${index + 1}", "heading-style-h5", "data-feature-grid-cards", "synchronizeCardHeights"],
  "src/components/sections/Testimonial.astro": ["peak-testimonial", "peak-testimonial__component", "peak-testimonial__client", "section_testimonial4", "testimonial4_client", "testimonial4_logo"],
  "src/components/sections/CtaBanner.astro": ["peak-cta-banner", "peak-cta-banner__component", "peak-cta-banner__card", "section_cta51", "cta51_card peak-cta-banner__card color-scheme-2"],
  "src/components/sections/Faq.astro": ["peak-faq", "peak-faq__component", "peak-faq__list", "peak-faq__item", "peak-faq__question", "peak-faq__answer", "section_faq1", "faq1_question", "faq1_answer"],
  "src/components/sections/ComparisonHero.astro": ["peak-comparison-hero", "peak-comparison-hero__content", "section_header1", "header1_content", "heading-style-h1"],
  "src/components/sections/ComparisonVerdict.astro": ["peak-comparison-verdict", "section_layout140", "layout140_component", "heading-style-h5"],
  "src/components/sections/ComparisonTable.astro": ["peak-comparison-table", "peak-comparison-table__card", "section_comparison14", "comparison14_grid-list", "comparison14_card"],
  "src/components/sections/PricingComparison.astro": ["peak-pricing-comparison", "section_pricing50", "pricing50_top-row", "pricing50_row"],
  "src/components/sections/DecisionGuide.astro": ["peak-decision-guide", "section_layout4", "layout4_content", "layout4_item-list"],
};

for (const [file, contracts] of Object.entries(canonicalContracts)) {
  const source = readFileSync(resolve(projectRoot, file), "utf8");
  for (const contract of contracts) {
    if (!source.includes(contract)) failures.push(`${file} is missing canonical class: ${contract}`);
  }
  if (/\bds-[\w-]+/.test(source)) failures.push(`${file} contains a parallel ds-* design pattern`);
}

const designSystemSource = readFileSync(resolve(projectRoot, "src/pages/design-system.astro"), "utf8");
if (/from ["'][^"']*partners/i.test(designSystemSource)) failures.push("The catalogue imports the unfinished partners page");

const partnersBuildFile = resolve(projectRoot, "dist/partners/index.html");
if (existsSync(partnersBuildFile)) failures.push("The unfinished partners page was included in the production build");

const notFoundBuildFile = resolve(projectRoot, "dist/404.html");
if (!existsSync(notFoundBuildFile)) failures.push("The build is missing the custom 404 page required to prevent homepage fallbacks");

for (const file of ["src/components/SiteHeader.astro", "src/components/SiteFooter.astro"]) {
  const source = readFileSync(resolve(projectRoot, file), "utf8");
  if (source.includes('href="/partners')) failures.push(`${file} exposes the unfinished partners page`);
}

const navigationSource = readFileSync(resolve(projectRoot, "src/data/site-navigation.ts"), "utf8");
for (const group of ["Connect", "Operate", "Manage & Enrich", "Solutions"]) {
  if (!navigationSource.includes(`label: "${group}"`)) failures.push(`Shared feature navigation is missing the ${group} group`);
}
for (const slug of [
  "/1-click-setup",
  "/shopify-sync",
  "/ai-catalog-connector",
  "/api",
  "/shopify-multi-store-pim",
  "/shopify-product-management",
  "/shopify-markets-pricing",
  "/bulk-edit",
  "/shopify-product-import-export",
  "/shopify-media-management",
  "/shopify-pim-translations",
  "/shopify-metaobjects",
  "/shopify-collections",
  "/shopify-metafield-management",
  "/shopify-custom-fields",
  "/shopify-product-drops",
  "/shopify-catalog-health-center",
  "/user-roles-permissions",
  "/industry/fashion",
]) {
  if (!navigationSource.includes(`href: "${slug}"`)) failures.push(`Shared feature navigation is missing ${slug}`);
}

const globalStyles = readFileSync(resolve(projectRoot, "src/styles/global.css"), "utf8");
for (const rule of ["-webkit-font-smoothing: antialiased", "-moz-osx-font-smoothing: grayscale"]) {
  if (!globalStyles.includes(rule)) failures.push(`Global typography is missing the original rendering rule: ${rule}`);
}

const featureGridSource = readFileSync(resolve(projectRoot, "src/components/sections/FeatureGrid.astro"), "utf8");
if (featureGridSource.includes("Math.min(index + 1, 4)")) failures.push("FeatureGrid must not extend the original four-card sticky interaction");

const faqSource = readFileSync(resolve(projectRoot, "src/components/sections/Faq.astro"), "utf8");
if (!faqSource.includes('title = "Frequently asked questions"')) failures.push("The shared FAQ component is missing the canonical feature-page title");

const recipeSource = readFileSync(resolve(projectRoot, "src/data/landing-page-recipes.ts"), "utf8");
const approvedReferences = recipeSource.split("export const excludedDesignSystemPages")[0];
if (approvedReferences.includes('"/partners"')) failures.push("The unfinished partners page appears in approved references");

for (const page of ["bulk-edit", "design-system", "shopify-pim-translations", "shopify-product-import-export", "shopify-product-drops", "shopify-catalog-health-center", "ai-catalog-connector", "api", "shopify-metaobjects", "shopify-metafield-management", "shopify-custom-fields", "user-roles-permissions", "shopify-collections", "shopify-markets-pricing", "shopify-product-management", "build-vs-buy-pim"]) {
  const file = resolve(projectRoot, "dist", page, "index.html");
  if (!existsSync(file)) {
    failures.push(`Missing built page /${page}; run npm run build first`);
    continue;
  }
  const html = readFileSync(file, "utf8");
  const h1Count = (html.match(/<h1\b/gi) ?? []).length;
  if (h1Count !== 1) failures.push(`/${page} has ${h1Count} h1 elements; expected one`);
  if (!html.includes("main-wrapper")) failures.push(`/${page} is missing the canonical main wrapper`);
}

for (const slug of [
  "1-click-setup",
  "shopify-sync",
  "ai-catalog-connector",
  "api",
  "shopify-multi-store-pim",
  "shopify-product-management",
  "shopify-markets-pricing",
  "bulk-edit",
  "shopify-product-import-export",
  "shopify-media-management",
  "shopify-pim-translations",
  "shopify-metaobjects",
  "shopify-collections",
  "shopify-metafield-management",
  "shopify-custom-fields",
  "shopify-product-drops",
  "shopify-catalog-health-center",
  "user-roles-permissions",
  "industry/fashion",
]) {
  const file = resolve(projectRoot, `dist/${slug}/index.html`);
  if (!existsSync(file)) {
    failures.push(`Feature FAQ heading check could not find built page: /${slug}`);
    continue;
  }

  const html = readFileSync(file, "utf8");
  const faqHtml = html.match(/<section\b[^>]*class="[^"]*\bsection_faq1\b[^"]*"[^>]*>[\s\S]*?<\/section>/)?.[0] ?? "";
  const title = faqHtml.match(/<h2\b[^>]*>(.*?)<\/h2>/)?.[1] ?? "";
  if (title !== "Frequently asked questions") failures.push(`/${slug} uses the FAQ heading “${title || "missing"}”`);
}

for (const feature of [
  { slug: "ai-catalog-connector", title: "AI Connector (MCP) for Shopify | Peak PIM", aria: "Peak PIM AI Connector (MCP) conversation showing a merchant asking about missing SEO descriptions and reviewing catalog results", crossLink: 'href="/api"' },
  { slug: "api", title: "Shopify Multi-Store Catalog API | Peak PIM", aria: "Peak PIM developer API workspace showing a store-specific product update and publish response", crossLink: 'href="/ai-catalog-connector"' },
  { slug: "shopify-metaobjects", title: "Shopify Metaobjects Management | Peak PIM", aria: "Peak PIM metaobject workspace showing a Size Guide definition, typed entry fields, and publishing results across Shopify stores", crossLink: 'href="/ai-catalog-connector"' },
  { slug: "shopify-metafield-management", title: "Shopify Metafield Management | Peak PIM", aria: "Peak PIM metafield definition workspace showing one Material definition linked across US, France, and Germany Shopify stores", crossLink: 'href="/shopify-custom-fields"' },
  { slug: "shopify-collections", title: "Shopify Collections Management | Peak PIM", aria: "Peak PIM collections workspace showing one Holiday Gifts collection with content, SEO, and product memberships across US, France, and Germany Shopify stores", crossLink: 'href="/shopify-catalog-health-center"', allowMultipleCrossLinks: true },
  { slug: "shopify-markets-pricing", title: "Shopify Markets &amp; Catalog Pricing | Peak PIM", aria: "Peak PIM Markets and Catalogs workspace showing fixed variant prices across France, Switzerland, United Kingdom, and two Shopify stores", crossLink: 'href="/shopify-product-import-export"', allowMultipleCrossLinks: true },
  { slug: "shopify-product-management", title: "Shopify Product &amp; Variant Management | Peak PIM", aria: "Peak PIM product workspace showing one Summit Shell Jacket with intentional field and variant differences across US, France, and Germany Shopify stores", crossLink: 'href="/bulk-edit"', allowMultipleCrossLinks: true },
  { slug: "user-roles-permissions", title: "Shopify PIM User Roles &amp; Permissions | Peak PIM", aria: "Peak PIM users and permissions workspace showing a catalog editor with selected stores and separate view, edit, and publish access", crossLink: 'href="/shopify-multi-store-pim"', allowMultipleCrossLinks: true },
]) {
  const file = resolve(projectRoot, `dist/${feature.slug}/index.html`);
  if (!existsSync(file)) continue;
  const html = readFileSync(file, "utf8");
  const mainHtml = html.match(/<main\b[\s\S]*?<\/main>/i)?.[0] ?? "";
  const heroHtml = html.match(/<header class="section_header26[\s\S]*?<\/header>/)?.[0] ?? "";
  const faqSchema = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1])).find((entry) => entry["@type"] === "FAQPage");
  if (!html.includes(`<title>${feature.title}</title>`)) failures.push(`${feature.slug} title tag is incorrect`);
  if (!html.includes(`rel="canonical" href="https://peak-pim.com/${feature.slug}/"`)) failures.push(`${feature.slug} canonical URL is incorrect`);
  if (!html.includes(`aria-label="${feature.aria}"`)) failures.push(`${feature.slug} hero visual accessible name is missing`);
  if (heroHtml.includes("<img")) failures.push(`${feature.slug} hero must use an HTML/CSS illustration`);
  const crossLinkCount = (mainHtml.match(new RegExp(feature.crossLink.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? []).length;
  if (feature.allowMultipleCrossLinks ? crossLinkCount < 1 : crossLinkCount !== 1) failures.push(`${feature.slug} must include its required cross-link`);
  if (faqSchema?.mainEntity?.length !== 9) failures.push(`${feature.slug} FAQ schema is missing or incomplete`);
  for (const className of ["section_header26", "section_logo2", "section_layout237", "section_layout395", "section_layout353", "section_cta51", "section_faq1"]) {
    if (!html.includes(className)) failures.push(`${feature.slug} is missing canonical section: ${className}`);
  }
}

const featureSeoSlugs = [
  "ai-catalog-connector",
  "api",
  "shopify-catalog-health-center",
  "shopify-collections",
  "shopify-custom-fields",
  "shopify-markets-pricing",
  "shopify-metafield-management",
  "shopify-metaobjects",
  "shopify-pim-translations",
  "shopify-product-drops",
  "shopify-product-import-export",
  "shopify-product-management",
  "user-roles-permissions",
];

for (const slug of featureSeoSlugs) {
  const file = resolve(projectRoot, `dist/${slug}/index.html`);
  const imageFile = resolve(projectRoot, `public/assets/og/${slug}.png`);
  if (!existsSync(file)) {
    failures.push(`Feature SEO check could not find built page: /${slug}`);
    continue;
  }
  if (!existsSync(imageFile)) {
    failures.push(`Feature SEO check could not find Open Graph image: /assets/og/${slug}.png`);
    continue;
  }

  const image = readFileSync(imageFile);
  const width = image.readUInt32BE(16);
  const height = image.readUInt32BE(20);
  if (width !== 1200 || height !== 630) failures.push(`${slug} Open Graph image must be 1200 × 630, got ${width} × ${height}`);

  const html = readFileSync(file, "utf8");
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
  const pageSchema = schemas.find((entry) => entry["@type"] === "WebPage");
  const softwareSchema = schemas.find((entry) => entry["@type"] === "SoftwareApplication");
  const expectedImage = `https://peak-pim.com/assets/og/${slug}.png`;

  if (!html.includes(`<meta property="og:image" content="${expectedImage}">`)) failures.push(`${slug} is missing its registered Open Graph image`);
  if (!html.includes(`<meta name="twitter:image" content="${expectedImage}">`)) failures.push(`${slug} is missing its registered Twitter image`);
  if (!html.includes('<meta name="twitter:card" content="summary_large_image">')) failures.push(`${slug} does not use a large social card`);
  if (pageSchema?.about?.["@id"] !== "https://peak-pim.com/#software") failures.push(`${slug} is not modeled as a page about Peak PIM`);
  if (softwareSchema?.name !== "Peak PIM") failures.push(`${slug} does not reference the canonical Peak PIM application`);
  if (softwareSchema?.applicationCategory !== "BusinessApplication" || softwareSchema?.operatingSystem !== "Web") failures.push(`${slug} application schema is incomplete`);
  if (softwareSchema?.offers?.map((offer) => offer.price).join(",") !== "99,249") failures.push(`${slug} application schema has outdated public offers`);
  if (schemas.filter((entry) => entry["@type"] === "SoftwareApplication").length !== 1) failures.push(`${slug} must describe exactly one software application`);
}

const rolesPermissionsFile = resolve(projectRoot, "dist/user-roles-permissions/index.html");
if (existsSync(rolesPermissionsFile)) {
  const html = readFileSync(rolesPermissionsFile, "utf8");
  const faqSchema = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1])).find((entry) => entry["@type"] === "FAQPage");
  if (faqSchema?.mainEntity?.length !== 9) failures.push("Roles and permissions FAQ schema is missing or incomplete");
  for (const fact of ["Core includes 3 seats", "Elite includes 15 seats", "Enterprise is custom", "Standard User Roles &amp; Permissions", "Advanced User Roles &amp; Permissions"]) {
    if (!html.includes(fact.replaceAll("&", "&amp;")) && !html.includes(fact)) failures.push(`Roles and permissions page is missing current plan guidance: ${fact}`);
  }
}

const metaobjectsFile = resolve(projectRoot, "dist/shopify-metaobjects/index.html");
if (existsSync(metaobjectsFile)) {
  const html = readFileSync(metaobjectsFile, "utf8");
  const mainHtml = html.match(/<main\b[\s\S]*?<\/main>/i)?.[0] ?? "";
  for (const link of ['href="/shopify-catalog-health-center"', 'href="/ai-catalog-connector"', 'href="/shopify-pim-translations"']) {
    if ((mainHtml.match(new RegExp(link.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? []).length !== 1) failures.push(`Metaobjects page must include exactly one cross-link: ${link}`);
  }
}

const customFieldsFile = resolve(projectRoot, "dist/shopify-custom-fields/index.html");
if (existsSync(customFieldsFile)) {
  const html = readFileSync(customFieldsFile, "utf8");
  const mainHtml = html.match(/<main\b[\s\S]*?<\/main>/i)?.[0] ?? "";
  const heroHtml = html.match(/<header class="section_header26[\s\S]*?<\/header>/)?.[0] ?? "";
  const faqSchema = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1])).find((entry) => entry["@type"] === "FAQPage");

  if (!html.includes("<title>Shopify Custom Fields &amp; Metafields | Peak PIM</title>")) failures.push("Custom Fields title tag is incorrect");
  if (!html.includes('rel="canonical" href="https://peak-pim.com/shopify-custom-fields/"')) failures.push("Custom Fields canonical URL is incorrect");
  if (!html.includes('aria-label="Peak PIM custom fields workspace showing Shopify metafields beside private PIM-only workflow fields on a product record"')) failures.push("Custom Fields hero visual accessible name is missing");
  if (heroHtml.includes("<img")) failures.push("Custom Fields hero must use an HTML/CSS illustration");
  if (faqSchema?.mainEntity?.length !== 9) failures.push("Custom Fields FAQ schema is missing or incomplete");
  for (const className of ["section_header26", "section_logo2", "section_layout237", "section_layout395", "section_layout353", "section_cta51", "section_faq1"]) {
    if (!html.includes(className)) failures.push(`Custom Fields page is missing canonical section: ${className}`);
  }
  for (const link of ['href="/shopify-catalog-health-center"', 'href="/shopify-product-import-export"', 'href="/shopify-metaobjects"']) {
    if ((mainHtml.match(new RegExp(link.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? []).length !== 1) failures.push(`Custom Fields page must include exactly one cross-link: ${link}`);
  }
  if (!html.includes("Reference-type metafields are editable on entity pages but are not import-mappable.")) failures.push("Custom Fields page is missing the reference-metafield import limitation");
}

const healthCenterFile = resolve(projectRoot, "dist/shopify-catalog-health-center/index.html");
if (existsSync(healthCenterFile)) {
  const html = readFileSync(healthCenterFile, "utf8");
  const heroHtml = html.match(/<header class="section_header26[\s\S]*?<\/header>/)?.[0] ?? "";
  const faqSchema = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]))
    .find((entry) => entry["@type"] === "FAQPage");

  if (!html.includes("<title>Shopify Catalog Health Center | Peak PIM</title>")) failures.push("Health Center title tag is incorrect");
  if (!html.includes('rel="canonical" href="https://peak-pim.com/shopify-catalog-health-center/"')) failures.push("Health Center canonical URL is incorrect");
  if (!html.includes('aria-label="Peak PIM Health Center dashboard showing catalog issues by synchronization, consistency, completeness, translations, and unused items"')) failures.push("Health Center hero visual accessible name is missing");
  if (heroHtml.includes("<img")) failures.push("Health Center hero must use an HTML/CSS illustration, not a raster image");
  if (!/href="https:\/\/apps\.shopify\.com\/peak-pim"[^>]*>Try for free<\/a>[\s\S]*?href="#health-workflow"[^>]*>See how it works<\/a>/.test(heroHtml)) failures.push("Health Center hero CTA order is incorrect");
  if (faqSchema?.mainEntity?.length !== 9) failures.push("Health Center FAQ schema is missing or incomplete");
  for (const className of ["section_header26", "section_logo2", "section_layout237", "section_layout395", "section_layout353", "section_cta51", "section_faq1"]) {
    if (!html.includes(className)) failures.push(`Health Center page is missing canonical section: ${className}`);
  }
  for (const className of ["peak-hero", "peak-logo-cloud", "peak-problem-grid", "peak-card-grid", "peak-feature-grid", "peak-cta-banner", "peak-faq"]) {
    if (!html.includes(className)) failures.push(`Health Center page is missing semantic component alias: ${className}`);
  }
}

const dropsFile = resolve(projectRoot, "dist/shopify-product-drops/index.html");
if (existsSync(dropsFile)) {
  const html = readFileSync(dropsFile, "utf8");
  const heroHtml = html.match(/<header class="section_header26[\s\S]*?<\/header>/)?.[0] ?? "";
  const faqSchema = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]))
    .find((entry) => entry["@type"] === "FAQPage");

  if (!html.includes("<title>Shopify Product Drops &amp; Scheduled Price Changes | Peak PIM</title>")) failures.push("Drops title tag is incorrect");
  if (!html.includes('rel="canonical" href="https://peak-pim.com/shopify-product-drops/"')) failures.push("Drops canonical URL is incorrect");
  if (!html.includes('aria-label="Peak PIM Drop review showing scheduled Shopify price and product changes with automatic rollback"')) failures.push("Drops hero visual accessible name is missing");
  if (heroHtml.includes("<img")) failures.push("Drops hero must use an HTML/CSS illustration, not a raster image");
  if (!/href="https:\/\/apps\.shopify\.com\/peak-pim"[^>]*>Try for free<\/a>[\s\S]*?href="#drops-workflow"[^>]*>See how it works<\/a>/.test(heroHtml)) failures.push("Drops hero CTA order is incorrect");
  if (faqSchema?.mainEntity?.length !== 9) failures.push("Drops FAQ schema is missing or incomplete");
  for (const className of ["section_header26", "section_logo2", "section_layout237", "section_layout395", "section_layout353", "section_cta51", "section_faq1"]) {
    if (!html.includes(className)) failures.push(`Drops page is missing canonical section: ${className}`);
  }
  for (const className of ["peak-hero", "peak-logo-cloud", "peak-problem-grid", "peak-card-grid", "peak-feature-grid", "peak-cta-banner", "peak-faq"]) {
    if (!html.includes(className)) failures.push(`Drops page is missing semantic component alias: ${className}`);
  }
}

const importExportFile = resolve(projectRoot, "dist/shopify-product-import-export/index.html");
if (existsSync(importExportFile)) {
  const html = readFileSync(importExportFile, "utf8");
  const heroHtml = html.match(/<header class="section_header26[\s\S]*?<\/header>/)?.[0] ?? "";
  const faqSchema = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]))
    .find((entry) => entry["@type"] === "FAQPage");

  if (!html.includes("<title>Shopify Product Import &amp; Export | Peak PIM</title>")) failures.push("Import-export title tag is incorrect");
  if (!html.includes('rel="canonical" href="https://peak-pim.com/shopify-product-import-export/"')) failures.push("Import-export canonical URL is incorrect");
  if (!html.includes('aria-label="Peak PIM import review showing a supplier spreadsheet mapped to catalog records with before and after changes"')) failures.push("Import-export hero visual accessible name is missing");
  if (heroHtml.includes("<img")) failures.push("Import-export hero must use an HTML/CSS illustration, not a raster image");
  if (!/href="https:\/\/apps\.shopify\.com\/peak-pim"[^>]*>Try for free<\/a>[\s\S]*?href="#import-export-workflow"[^>]*>See how it works<\/a>/.test(heroHtml)) failures.push("Import-export hero CTA order is incorrect");
  if (faqSchema?.mainEntity?.length !== 9) failures.push("Import-export FAQ schema is missing or incomplete");
  for (const className of ["section_header26", "section_logo2", "section_layout237", "section_layout395", "section_layout353", "section_cta51", "section_faq1"]) {
    if (!html.includes(className)) failures.push(`Import-export page is missing canonical section: ${className}`);
  }
  for (const className of ["peak-hero", "peak-logo-cloud", "peak-problem-grid", "peak-card-grid", "peak-feature-grid", "peak-cta-banner", "peak-faq"]) {
    if (!html.includes(className)) failures.push(`Import-export page is missing semantic component alias: ${className}`);
  }
}

const homeFile = resolve(projectRoot, "dist/index.html");
if (existsSync(homeFile)) {
  const html = readFileSync(homeFile, "utf8");
  const heroHtml = html.match(/<header class="section_landing-big_hero-header"[\s\S]*?<div class="landing-big_hero-header_image-wrapper">/)?.[0] ?? "";
  const footerHtml = html.match(/<footer class="footer1_component"[\s\S]*?<\/footer>/)?.[0] ?? "";
  if (!/href="https:\/\/apps\.shopify\.com\/peak-pim"[^>]*class="button w-button">Try for free<\/a>[\s\S]*?<a(?=[^>]*href="https:\/\/calendar\.app\.google\/M9DEEDbc6AxRaNNX6")(?=[^>]*target="_blank")(?=[^>]*rel="noopener")[^>]*class="button is-secondary w-button"[^>]*>Book a demo<\/a>/.test(heroHtml)) {
    failures.push("Homepage hero must show Try for free first and Book a demo second using the canonical button variants");
  }
  if ((footerHtml.match(/class="footer1_link-column/g) ?? []).length !== 5) failures.push("The shared footer must contain the Features area plus four dedicated link columns");
  for (const heading of ["Features", "Solutions", "Compare", "Peak", "Resources"]) {
    if (!footerHtml.includes(`aria-hidden="true"></span>${heading}</div>`)) failures.push(`The shared footer is missing its marked column: ${heading}`);
  }
  for (const group of ["Connect", "Operate", "Manage &amp; Enrich"]) {
    if (!footerHtml.includes(`site-footer__feature-category-title">${group}</div>`)) failures.push(`The footer Features column is missing its ${group} category`);
  }
  if (footerHtml.includes('site-footer__feature-category-title">Solutions</div>')) failures.push("Solutions must be a dedicated footer column, not a Features sub-column");
  if ((footerHtml.match(/href="\/industry\/fashion" class="footer1_link">Fashion<\/a>/g) ?? []).length !== 1) failures.push("The footer must place Fashion exactly once under Solutions");
  if (!/href="\/shopify-pim-alternatives"[^>]*>PIM alternatives<\/a><a href="\/build-vs-buy-pim\/"[^>]*>Build vs buy a PIM<\/a>/.test(footerHtml)) failures.push("The footer must place Build vs buy a PIM directly after PIM alternatives");
  if ((footerHtml.match(/class="site-footer__heading-marker"/g) ?? []).length !== 5) failures.push("Every footer column heading must use the shared circle marker");
  if (/⚡️|⛰️|🔍|🤙/.test(footerHtml)) failures.push("The footer still contains decorative column emojis");
  if ((footerHtml.match(/class="footer1_social-link w-inline-block"/g) ?? []).length !== 6) failures.push("The footer must preserve all six original social-network links");
  if ((footerHtml.match(/class="icon-embed-xsmall w-embed"/g) ?? []).length !== 6) failures.push("Every footer social-network link must preserve its icon");
}

const buildVsBuyFile = resolve(projectRoot, "dist/build-vs-buy-pim/index.html");
if (existsSync(buildVsBuyFile)) {
  const html = readFileSync(buildVsBuyFile, "utf8");
  const mainHtml = html.match(/<main\b[\s\S]*?<\/main>/i)?.[0] ?? "";
  const pageSource = readFileSync(resolve(projectRoot, "src/pages/build-vs-buy-pim.astro"), "utf8");
  const h2Count = (mainHtml.match(/<h2\b/gi) ?? []).length;
  const jsonLdEntries = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));

  if (!html.includes("<title>Build vs Buy a Shopify PIM: an honest comparison</title>")) failures.push("Build-vs-buy title tag is incorrect");
  if (!html.includes('name="description" content="Compare the real product, engineering, Shopify maintenance, and operating work behind building a PIM in-house versus using Peak PIM."')) failures.push("Build-vs-buy meta description is incorrect");
  if (!html.includes('rel="canonical" href="https://peak-pim.com/build-vs-buy-pim/"')) failures.push("Build-vs-buy canonical URL is incorrect");
  if (!html.includes('property="og:image" content="https://peak-pim.com/og-build-vs-buy-pim.png"')) failures.push("Build-vs-buy Open Graph image is incorrect");
  if (!html.includes('alt="Post describing a team returning to Linear because maintaining its internally built tool consumed work bandwidth"')) failures.push("Build-vs-buy evidence image alt text is missing");
  if (!html.includes('src="/assets/marketing/build-vs-buy-maintenance-example.webp"')) failures.push("Build-vs-buy hero is missing its registered evidence image");
  if (!html.includes('aria-label="Decision workspace comparing when to build a PIM in-house and when to choose Peak PIM"')) failures.push("Build-vs-buy decision visual alt text is missing");
  if (h2Count !== 7) failures.push(`Build-vs-buy page has ${h2Count} h2 elements; expected seven`);
  if (!jsonLdEntries.some((entry) => entry["@type"] === "Article" && entry.author?.name === "Peak PIM")) failures.push("Build-vs-buy Article schema is missing or incorrect");
  if (!jsonLdEntries.some((entry) => entry["@type"] === "FAQPage" && entry.mainEntity?.length === 6)) failures.push("Build-vs-buy FAQ schema is missing or incomplete");
  for (const href of ['href="/pricing/"', 'href="/shopify-pim-alternatives/"']) {
    if (!html.includes(href)) failures.push(`Build-vs-buy page is missing required internal link: ${href}`);
  }
  for (const className of ["section_header1", "section_layout140", "section_comparison14", "section_pricing50", "section_layout4", "section_layout353", "section_faq1", "section_cta51"]) {
    if (!html.includes(className)) failures.push(`Build-vs-buy page is missing canonical comparison section: ${className}`);
  }
  const heroHtml = html.match(/<header class="section_header1[\s\S]*?<\/header>/)?.[0] ?? "";
  const decisionHtml = html.match(/<section id="decision"[\s\S]*?<\/section>/)?.[0] ?? "";
  if ((heroHtml.match(/<img\b/g) ?? []).length !== 1 || !heroHtml.includes('src="/assets/marketing/build-vs-buy-maintenance-example.webp"')) failures.push("Build-vs-buy hero must use its single approved evidence image");
  if (decisionHtml.includes("<img")) failures.push("Build-vs-buy decision section must use an HTML/CSS illustration, not a raster image");
  if (!/href="#comparison"[^>]*>See comparison<\/a>[\s\S]*?href="https:\/\/apps\.shopify\.com\/peak-pim"[^>]*>Try for free<\/a>/.test(heroHtml)) {
    failures.push("Build-vs-buy hero must show See comparison first and Try for free second");
  }
  if (/\bbuild-buy-section\b|\bpeak-subnav\b/.test(html)) failures.push("Build-vs-buy page still contains its retired one-off section system");
  for (const bannedCopy of ["—", "game-changer", "revolutionary", "unlocks", "join the beta"]) {
    if (pageSource.toLowerCase().includes(bannedCopy)) failures.push(`Build-vs-buy source contains banned copy: ${bannedCopy}`);
  }
}

const pricingFile = resolve(projectRoot, "dist/pricing/index.html");
if (existsSync(pricingFile)) {
  const html = readFileSync(pricingFile, "utf8");
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ?? "{}");
  if (html.includes("Not sure if you should build it instead?") || html.includes("pricing-build-vs-buy-link")) failures.push("Pricing page contains the retired build-vs-buy promotion");
  if (!html.includes('rel="canonical" href="https://peak-pim.com/pricing/"')) failures.push("Pricing canonical URL does not match the 200 response URL");
  if (html.includes("unlimited stores")) failures.push("Pricing page still contains the outdated unlimited-stores claim");
  if (html.includes("next billing cycle")) failures.push("Pricing schema conflicts with the visible plan-change policy");
  if (!schema.offers?.every((offer) => offer.availability === "https://schema.org/InStock")) failures.push("Pricing schema does not describe the live plans as available");
  if (schema.featureList?.length !== 32) failures.push("Pricing schema feature list is incomplete");
  if (!schema.offers?.every((offer) => offer.additionalProperty?.length === 32)) failures.push("Pricing schema offers are not generated from the complete pricing matrix");
  const schemaFeatureValue = (planName, featureName) => schema.offers
    ?.find((offer) => offer.name === planName)
    ?.additionalProperty?.find((property) => property.name === featureName)?.value;
  for (const [planName, featureName, expectedValue] of [
    ["Core", "Drops", "Not included"],
    ["Elite", "Drops", "Included"],
    ["Enterprise", "Metaobjects", "Included"],
    ["Elite", "Custom fields", "Included"],
    ["Core", "Amazon sync", "Coming soon"],
    ["Enterprise", "Automations", "Coming soon"],
    ["Core", "Scores", "Coming soon"],
    ["Elite", "Backups & History", "Coming soon"],
    ["Enterprise", "Global search", "Coming soon"],
  ]) {
    if (schemaFeatureValue(planName, featureName) !== expectedValue) failures.push(`Pricing schema has an incorrect ${planName} value for ${featureName}`);
  }
  for (const currentPricingFact of ["1,500 SKUs, 2 connected Shopify stores, 3 seats, and 100GB files", "5,000 SKUs, 3 connected Shopify stores, 15 seats, and 500GB files", "Enterprise limits are custom"]) {
    if (!html.includes(currentPricingFact)) failures.push(`Pricing crawler content is missing: ${currentPricingFact}`);
  }
  for (const category of ["Plan limits", "Connect", "Operate", "Manage &amp; Enrich", "Support"]) {
    if (!html.includes(`class="heading-style-h6">${category}</div>`)) failures.push(`Pricing matrix is missing category: ${category}`);
  }
  for (const feature of ["Shopify sync", "Amazon sync", "Media management", "Health Center", "Markets &amp; catalogs", "AI Connector (MCP)", "Drops", "Automations", "Scores", "Backups &amp; History", "Global search"]) {
    if (!html.includes(`<span>${feature}</span>`)) failures.push(`Pricing matrix is missing feature: ${feature}`);
  }
  for (const feature of ["AI Connector (MCP)", "Drops", "Health Center", "Markets &amp; catalogs"]) {
    if (!html.includes(`<span>${feature}</span><span class="feature-status-badge">New</span>`)) failures.push(`Pricing matrix is missing the New badge for: ${feature}`);
  }
  for (const href of ["/shopify-sync", "/shopify-media-management", "/shopify-catalog-health-center", "/shopify-markets-pricing"]) {
    if (!html.includes(`href="${href}" class="pricing-feature-popover__link"`)) failures.push(`Pricing matrix is missing feature detail link: ${href}`);
  }
  if ((html.match(/class="pricing-feature-info"/g) ?? []).length !== 32) failures.push("Pricing matrix information disclosures are incomplete");
  if (!html.includes('summary aria-label="About Shopify sync"')) failures.push("Pricing matrix information controls are not accessibly labelled");
  if (!html.includes('<a href="https://app.peak-pim.com/demo" target="_blank" rel="noopener" class="footer1_link">Live demo</a>')) failures.push("Shared footer is missing the external Live demo link");
  if (!html.includes('site-footer__column-heading"><span class="site-footer__heading-marker" aria-hidden="true"></span>Resources</div>')) failures.push("Shared footer is missing the Resources column");
  if (!html.includes('class="footer1_link-list site-footer__social-links site-footer__bottom-social-links"')) failures.push("Shared footer social icons are not grouped in the bottom bar");
  if (!html.includes('class="site-footer__logo-cta"><a href="https://app.peak-pim.com/demo" target="_blank" rel="noopener" class="button is-secondary w-button">Live demo</a>')) failures.push("Shared footer is missing the Live demo CTA beneath the Peak logo");
  if (html.includes('site-footer__column-heading"><span class="site-footer__heading-marker" aria-hidden="true"></span>Connect</div>')) failures.push("Shared footer still contains the retired Connect column");
  if (!html.includes('<a href="https://app.peak-pim.com/demo" target="_blank" rel="noopener" class="feature-mega-menu__demo-link">Live demo<span aria-hidden="true">&rarr;</span></a>')) failures.push("Features mega menu is missing the external Live demo link");
}

const sitemapFile = resolve(projectRoot, "dist/sitemap.xml");
if (existsSync(sitemapFile)) {
  const sitemap = readFileSync(sitemapFile, "utf8");
  const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  if (!sitemap.includes("https://peak-pim.com/build-vs-buy-pim/")) failures.push("Sitemap is missing the build-vs-buy URL");
  if (!sitemap.includes("https://peak-pim.com/shopify-custom-fields/")) failures.push("Sitemap is missing the Custom Fields URL");
  if (!sitemap.includes("https://peak-pim.com/shopify-metafield-management/")) failures.push("Sitemap is missing the Metafields URL");
  if (!sitemap.includes("https://peak-pim.com/shopify-collections/")) failures.push("Sitemap is missing the Collections URL");
  if (!sitemap.includes("https://peak-pim.com/shopify-markets-pricing/")) failures.push("Sitemap is missing the Markets and Catalogs URL");
  if (!sitemap.includes("https://peak-pim.com/shopify-product-management/")) failures.push("Sitemap is missing the Product Management URL");
  if (!sitemap.includes("https://peak-pim.com/blog/")) failures.push("Sitemap is missing the article index URL");
  if (!sitemap.includes("https://peak-pim.com/guides/")) failures.push("Sitemap is missing the guide index URL");
  if (sitemap.includes("https://peak-pim.com/partners/")) failures.push("Sitemap exposes the unfinished partners page");
  if (sitemapUrls.some((url) => url !== "https://peak-pim.com/" && !url.endsWith("/"))) failures.push("Sitemap contains a URL that redirects to its trailing-slash version");
  if ((sitemap.match(/<lastmod>/g) ?? []).length !== sitemapUrls.length) failures.push("Sitemap last-modified dates are incomplete");

  const approvedCtas = new Set([
    "Get Peak PIM",
    "Try for free",
    "Book a demo",
    "Live demo",
    "Talk to us",
    "See pricing",
    "See how it works",
    "See the comparison",
    "Learn more",
    "See comparison",
  ]);

  for (const pageUrl of sitemapUrls) {
    const pathname = new URL(pageUrl).pathname;
    const pageFile = resolve(projectRoot, "dist", pathname.replace(/^\//, ""), "index.html");

    if (!existsSync(pageFile)) {
      failures.push(`CTA check could not find built page: ${pathname}`);
      continue;
    }

    const pageHtml = readFileSync(pageFile, "utf8");
    const elementPattern = /<(a|button)\b([^>]*)>([\s\S]*?)<\/\1>/gi;

    for (const match of pageHtml.matchAll(elementPattern)) {
      const className = match[2].match(/class=(["'])(.*?)\1/i)?.[2] ?? "";
      if (!className.split(/\s+/).includes("button")) continue;

      const label = match[3]
        .replace(/<script\b[\s\S]*?<\/script>/gi, "")
        .replace(/<style\b[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, "")
        .replaceAll("&amp;", "&")
        .replaceAll("&nbsp;", " ")
        .replaceAll("&#39;", "'")
        .replaceAll("&apos;", "'")
        .replaceAll("&quot;", '"')
        .replace(/\s+/g, " ")
        .trim();

      if (!approvedCtas.has(label)) failures.push(`${pathname} contains non-approved CTA copy: ${label}`);
      if (label === "Book a demo") {
        if (!match[2].includes('href="https://calendar.app.google/M9DEEDbc6AxRaNNX6"')) failures.push(`${pathname} contains a Book a demo CTA with the wrong destination`);
        if (!match[2].includes('target="_blank"') || !match[2].includes('rel="noopener"')) failures.push(`${pathname} contains a Book a demo CTA that does not open safely in a new tab`);
        if (/data-open-crisp/i.test(match[2])) failures.push(`${pathname} contains a Book a demo CTA that still opens Crisp`);
      }
    }
  }
}

const forbiddenEmDashPattern = /\u2014|&(?:mdash|#8212|#x2014);/i;
const collectBuiltTextFiles = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const path = resolve(directory, entry.name);
  if (entry.isDirectory()) return collectBuiltTextFiles(path);
  return /\.(?:html|xml|txt|json|js|css)$/.test(entry.name) ? [path] : [];
});

for (const file of collectBuiltTextFiles(resolve(projectRoot, "dist"))) {
  if (statSync(file).size === 0) continue;
  if (forbiddenEmDashPattern.test(readFileSync(file, "utf8"))) {
    failures.push(`Rendered website contains a forbidden em dash or em-dash entity: ${file.replace(`${projectRoot}/`, "")}`);
  }
}

const translationFile = resolve(projectRoot, "dist/shopify-pim-translations/index.html");
if (existsSync(translationFile)) {
  const html = readFileSync(translationFile, "utf8");
  const mainHtml = html.match(/<main\b[\s\S]*?<\/main>/i)?.[0] ?? "";
  const heroHtml = html.match(/<header class="section_header26[\s\S]*?<\/header>/)?.[0] ?? "";
  const faqSchema = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1])).find((entry) => entry["@type"] === "FAQPage");
  for (const className of ["section_header26", "section_logo2", "section_layout237", "section_layout395", "section_testimonial4", "section_layout353", "section_cta51", "section_faq1"]) {
    if (!html.includes(className)) failures.push(`Translations page is missing ${className}`);
  }
  for (const className of ["peak-hero", "peak-logo-cloud", "peak-problem-grid", "peak-card-grid", "peak-testimonial", "peak-feature-grid", "peak-cta-banner", "peak-faq"]) {
    if (!html.includes(className)) failures.push(`Translations page is missing semantic component alias ${className}`);
  }
  if (/\bds-[\w-]+/.test(html)) failures.push("Translations page contains parallel ds-* classes");
  if (!html.includes('rel="canonical" href="https://peak-pim.com/shopify-pim-translations/"')) failures.push("Translations canonical URL is incorrect");
  if (!html.includes('aria-label="Peak PIM translation workflow showing catalog coverage, AI-generated drafts, side-by-side review, and multi-store publishing"')) failures.push("Translations hero visual accessible name is missing");
  if (heroHtml.includes("<img")) failures.push("Translations hero must use an HTML/CSS illustration");
  if (faqSchema?.mainEntity?.length !== 9) failures.push("Translations FAQ schema is missing or incomplete");
  for (const link of ['href="/ai-catalog-connector"', 'href="/shopify-catalog-health-center"']) {
    if ((mainHtml.match(new RegExp(link.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? []).length !== 1) failures.push(`Translations page must include exactly one cross-link: ${link}`);
  }
}

const homepageLogoBannerPages = [
  "shopify-product-import-export",
  "shopify-product-drops",
  "shopify-catalog-health-center",
  "ai-catalog-connector",
  "api",
  "shopify-pim-translations",
  "shopify-metaobjects",
  "shopify-metafield-management",
  "shopify-custom-fields",
  "shopify-collections",
  "shopify-markets-pricing",
  "shopify-product-management",
  "user-roles-permissions",
  "shopify-media-management",
  "industry/fashion",
];
const homepageLogoFiles = [
  "Tupperware-White-logo",
  "Mae-li-White-logo",
  "Artefact-White-logo",
  "Du-Bruit-Dans-La-Cuisine-White-logo",
];

for (const slug of homepageLogoBannerPages) {
  const file = resolve(projectRoot, `dist/${slug}/index.html`);
  if (!existsSync(file)) {
    failures.push(`Homepage logo-banner check could not find built page: /${slug}`);
    continue;
  }

  const html = readFileSync(file, "utf8");
  const mainHtml = html.match(/<main\b[\s\S]*?<\/main>/i)?.[0] ?? "";
  const bannerHtml = mainHtml.match(/<section\b[^>]*class="[^"]*\bsection_logo2\b[^"]*"[^>]*>[\s\S]*?<\/section>/)?.[0] ?? "";

  if (!bannerHtml) failures.push(`/${slug} is missing the homepage logo banner`);
  if ((mainHtml.match(/\bsection_logo3\b/g) ?? []).length) failures.push(`/${slug} still contains the retired scrolling logo banner`);
  if (!bannerHtml.includes(">Already trusted by top merchants</h2>")) failures.push(`/${slug} does not use the homepage logo-banner heading`);
  if ((bannerHtml.match(/\blogo2_wrapper\b/g) ?? []).length !== 4) failures.push(`/${slug} does not use the homepage four-logo set`);
  for (const logoFile of homepageLogoFiles) {
    if (!bannerHtml.includes(logoFile)) failures.push(`/${slug} is missing homepage customer logo: ${logoFile}`);
  }
}

const robots = readFileSync(resolve(projectRoot, "public/robots.txt"), "utf8");
if (!robots.includes("Allow: /") || !robots.includes("Sitemap: https://peak-pim.com/sitemap.xml")) failures.push("Crawler discovery directives are incomplete");

const llmsText = readFileSync(resolve(projectRoot, "public/llms.txt"), "utf8");
if ((llmsText.match(/^## Current Pricing$/gm) ?? []).length !== 1) failures.push("llms.txt must contain exactly one Current Pricing section");
for (const featureUrl of ["https://peak-pim.com/shopify-product-import-export/", "https://peak-pim.com/shopify-product-drops/", "https://peak-pim.com/shopify-catalog-health-center/", "https://peak-pim.com/ai-catalog-connector/", "https://peak-pim.com/api/", "https://peak-pim.com/shopify-metaobjects/", "https://peak-pim.com/shopify-collections/", "https://peak-pim.com/shopify-markets-pricing/", "https://peak-pim.com/shopify-product-management/", "https://peak-pim.com/shopify-metafield-management/", "https://peak-pim.com/shopify-custom-fields/", "https://peak-pim.com/user-roles-permissions/"]) {
  if (!llmsText.includes(featureUrl)) failures.push(`Crawler summary is missing feature page: ${featureUrl}`);
}

const bulkEditBuiltFile = resolve(projectRoot, "dist/bulk-edit/index.html");
if (existsSync(bulkEditBuiltFile) && readFileSync(bulkEditBuiltFile, "utf8").includes("Scheduled edits are on our roadmap")) {
  failures.push("Bulk-edit FAQ still describes Drops as a roadmap feature");
}

const llms = readFileSync(resolve(projectRoot, "public/llms.txt"), "utf8");
for (const pricingFact of ["Core: $99 per month or $990 per year", "Elite: $249 per month or $2,490 per year", "Enterprise: Custom pricing", "10-day free trial"]) {
  if (!llms.includes(pricingFact)) failures.push(`llms.txt is missing current pricing guidance: ${pricingFact}`);
}

const redirects = readFileSync(resolve(projectRoot, "public/_redirects"), "utf8");
if (!redirects.includes("/pricing /pricing/ 301")) failures.push("Pricing is missing its crawler-friendly permanent redirect");

const multiStoreFile = resolve(projectRoot, "dist/shopify-multi-store-pim/index.html");
if (existsSync(multiStoreFile)) {
  const html = readFileSync(multiStoreFile, "utf8");
  const planCount = (html.match(/class="pricing29_plan"/g) ?? []).length;
  for (const retiredPlanContent of ['>Scale</div>', '"name": "Scale"', "Scale supports 8", "$499"]) {
    if (html.includes(retiredPlanContent)) failures.push(`Multi-store page still contains retired Scale plan content: ${retiredPlanContent}`);
  }
  if (planCount !== 3) failures.push(`Multi-store pricing teaser has ${planCount} plans; expected three after removing Scale`);
  if (!html.includes("Scale as you grow.")) failures.push("Generic non-plan Scale copy was removed from the multi-store page");
  for (const currentPlanContent of ["100GB files", "Up to 3 Shopify stores", "500GB files", "Custom Shopify stores", "Custom file storage", "Dedicated support", "Core supports 2 stores and Elite supports 3"]) {
    if (!html.includes(currentPlanContent)) failures.push(`Multi-store page is missing current pricing content: ${currentPlanContent}`);
  }
  for (const outdatedPlanContent of ["20 GB media library", "Up to 5 Shopify stores", "150 GB media library", "Unlimited Shopify stores", "unlimited on Enterprise", "Custom media storage", ">Metaobjects</div>", ">Translations</div>", "Account manager", "Elite supports 5"]) {
    if (html.includes(outdatedPlanContent)) failures.push(`Multi-store page still contains outdated pricing content: ${outdatedPlanContent}`);
  }
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`Design-system contract passed (${requiredFiles.length} required files).`);
