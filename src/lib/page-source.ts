import { pagesBySlug, type PageDefinition } from "../data/pages";
import { normalizeCtaCopyInHtml } from "../data/cta-copy";
import { pricingFeatureGroups, type PricingPlanValue } from "../data/pricing-feature-matrix";
import { featureNavigationGroups } from "../data/site-navigation";

const pageModules = import.meta.glob<string>(
  ["../content/recreated-pages/*.html", "!../content/recreated-pages/partners.html"],
  {
    eager: true,
    query: "?raw",
    import: "default",
  },
);

const homeHtml = pageModules["../content/recreated-pages/index.html"];

function firstMatch(html: string, pattern: RegExp) {
  return html.match(pattern)?.[0] ?? "";
}

function innerMatch(html: string, pattern: RegExp) {
  return html.match(pattern)?.[1] ?? "";
}

const sharedHeaderHtml = normalizeCtaCopyInHtml(
  firstMatch(
    homeHtml,
    /<div data-animation="default" class="navbar12_component[\s\S]*?<main class="main-wrapper">/,
  ).replace(/<main class="main-wrapper">$/, ""),
);

const sharedGlobalStylesHtml = firstMatch(homeHtml, /<div class="global-styles">[\s\S]*?<\/div><\/div>/);

const sharedFooterHtml = normalizeCtaCopyInHtml(firstMatch(homeHtml, /<footer class="footer1_component"[\s\S]*?<\/footer>/));
const sharedLogoBannerHtml = firstMatch(homeHtml, /<section class="section_logo2 color-scheme-2">[\s\S]*?<\/section>/);
const featurePageSlugs = new Set(featureNavigationGroups.flatMap((group) => group.links.map((link) => link.href.replace(/^\//, "").replace(/\/$/, ""))));

export function getPage(slug = "") {
  return pagesBySlug.get(slug);
}

export function getPageDocument(page: PageDefinition) {
  const sourceHtml = pageModules[`../content/recreated-pages/${page.source}`];

  if (!sourceHtml) {
    throw new Error(`Missing recreated page source: ${page.source}`);
  }

  const correctedHtml = applyContentCorrections(sourceHtml, page);
  const html = normalizeCtaCopyInHtml(featurePageSlugs.has(page.slug) ? harmonizeFeatureFaqHeading(correctedHtml) : correctedHtml);

  return {
    html,
    headHtml: cleanHead(innerMatch(html, /<head[^>]*>([\s\S]*?)<\/head>/i)),
    mainHtml: ensurePrimaryHeading(extractMain(html), page),
    htmlClass: innerMatch(html, /<html[^>]*class="([^"]*)"/i),
    wfPage: innerMatch(html, /<html[^>]*data-wf-page="([^"]*)"/i),
    wfSite: innerMatch(html, /<html[^>]*data-wf-site="([^"]*)"/i),
  };
}

function applyContentCorrections(html: string, page: PageDefinition) {
  if (page.slug === "") {
    return correctHomepagePricingCta(html);
  }

  if (["shopify-media-management", "industry/fashion"].includes(page.slug)) {
    return replaceLogoBannerWithHomepageVersion(html);
  }

  if (page.slug === "pricing") {
    return improvePricingCrawlerContent(html);
  }

  if (page.slug === "bulk-edit") {
    return html.replace(
      "Bulk edits apply immediately. Scheduled edits are on our roadmap. If it's a priority for you, let us know and we'll bump it up.",
      "Yes. Select products, variants, or collections in the bulk editor, set the new values, and choose Schedule to add every change to a Drop. Peak applies them at the start time and can restore the captured live values automatically at the end.",
    );
  }

  if (page.slug !== "shopify-multi-store-pim") {
    return html;
  }

  const scalePlanCardStart = '<div class="pricing29_plan"><div class="pricing29_content-top"><div class="margin-bottom margin-xxsmall"><div class="pricing29_content-title"><div class="heading-style-h6">Scale</div>';
  const enterprisePlanCardStart = '<div class="pricing29_plan"><div class="pricing29_content-top"><div class="margin-bottom margin-xxsmall"><div class="pricing29_content-title"><div class="heading-style-h6">Enterprise</div>';
  const scalePlanOffer = `
      {
        "@type": "Offer",
        "name": "Scale",
        "description": "Up to 8 Shopify stores, Up to 30,000 SKUs, 500 GB media library",
        "url": "/pricing"
      },`;
  const scalePlanFaqAnswer = "It depends on your plan. Core supports 2 stores, Elite supports 5, Scale supports 8, and Enterprise supports unlimited stores. You can connect additional stores at any time from your Peak PIM dashboard.";
  const currentPlanFaqAnswer = "Core supports 2 stores and Elite supports 3. Need more? Contact us about an Enterprise plan.";
  const outdatedMultiStorePlanAnswer = "Yes. Every Peak PIM plan supports multiple stores. The number of stores you can connect scales with your plan: from 2 stores on Core up to unlimited on Enterprise.";
  const outdatedVisibleMultiStorePlanAnswer = "Yes. Every Peak PIM plan supports multiple stores. The number of stores you can connect scales with your plan. From 2 stores on Core up to unlimited on Enterprise.";
  const currentMultiStorePlanAnswer = "Yes. Every Peak PIM plan supports multiple stores. Core includes 2 stores and Elite includes 3. For additional stores, contact us about an Enterprise plan.";
  const scalePlanCardIndex = html.indexOf(scalePlanCardStart);
  const enterprisePlanCardIndex = html.indexOf(enterprisePlanCardStart, scalePlanCardIndex);

  if (scalePlanCardIndex === -1 || enterprisePlanCardIndex === -1 || !html.includes(scalePlanOffer) || !html.includes(scalePlanFaqAnswer)) {
    throw new Error("The retired Scale plan content could not be removed from the multi-store page.");
  }

  const withoutScalePlanCard = html.slice(0, scalePlanCardIndex) + html.slice(enterprisePlanCardIndex);
  const withCurrentLimits = withoutScalePlanCard
    .replace(scalePlanOffer, "")
    .replaceAll(scalePlanFaqAnswer, currentPlanFaqAnswer)
    .replaceAll(outdatedMultiStorePlanAnswer, currentMultiStorePlanAnswer)
    .replaceAll(outdatedVisibleMultiStorePlanAnswer, currentMultiStorePlanAnswer)
    .replace('"description": "Up to 2 Shopify stores, Up to 1,500 SKUs, 20 GB media library"', '"description": "Up to 2 Shopify stores, Up to 1,500 SKUs, 100GB files"')
    .replace('"description": "Up to 5 Shopify stores, Up to 5,000 SKUs, 150 GB media library"', '"description": "Up to 3 Shopify stores, Up to 5,000 SKUs, 500GB files"')
    .replace('"description": "Unlimited Shopify stores, Custom SKU limits, Custom media storage, Metaobjects, Translations, Account manager"', '"description": "Custom Shopify stores, Custom SKU limits, Custom file storage, Dedicated support"')
    .replaceAll("20 GB media library", "100GB files")
    .replaceAll("Up to 5 Shopify stores", "Up to 3 Shopify stores")
    .replaceAll("150 GB media library", "500GB files")
    .replaceAll("Unlimited Shopify stores", "Custom Shopify stores")
    .replaceAll("Custom media storage", "Custom file storage")
    .replaceAll("Account manager", "Dedicated support");

  return removePricingFeature(removePricingFeature(withCurrentLimits, enterprisePlanCardStart, "Metaobjects"), enterprisePlanCardStart, "Translations");
}

function correctHomepagePricingCta(html: string) {
  const incorrectCta = '<a data-open-crisp="" href="/pricing" class="button is-secondary is-alternate w-button">See pricing</a>';
  const correctedCta = '<a href="/pricing/" class="button is-secondary is-alternate w-button">See pricing</a>';

  if (!html.includes(incorrectCta)) {
    throw new Error("The homepage pricing preview CTA could not be corrected.");
  }

  return html.replace(incorrectCta, correctedCta);
}

function replaceLogoBannerWithHomepageVersion(html: string) {
  const logoBannerPattern = /<section\b[^>]*class="section_logo[23] color-scheme-[12]"[^>]*>[\s\S]*?<\/section>/;

  if (!sharedLogoBannerHtml || !logoBannerPattern.test(html)) {
    throw new Error("The page logo banner could not be replaced with the homepage version.");
  }

  return html.replace(logoBannerPattern, sharedLogoBannerHtml);
}

function harmonizeFeatureFaqHeading(html: string) {
  const faqStart = html.search(/<section\b[^>]*class="[^"]*\bsection_faq1\b[^"]*"[^>]*>/);

  if (faqStart === -1) {
    throw new Error("The feature page is missing its FAQ section.");
  }

  const faqEnd = html.indexOf("</section>", faqStart);
  const faqHtml = html.slice(faqStart, faqEnd + "</section>".length);
  const updatedFaqHtml = faqHtml.replace(
    /<h2\b([^>]*)>(?:FAQ|Questions|Frequently asked questions)<\/h2>/,
    '<h2$1>Frequently asked questions</h2>',
  );

  if (updatedFaqHtml === faqHtml && !faqHtml.includes(">Frequently asked questions</h2>")) {
    throw new Error("The feature FAQ heading could not be harmonized.");
  }

  return html.slice(0, faqStart) + updatedFaqHtml + html.slice(faqEnd + "</section>".length);
}

function improvePricingCrawlerContent(html: string) {
  const replacements = [
    ['"url": "/pricing"', '"url": "https://peak-pim.com/pricing/"'],
    ['"url": "/mirror/69b1823397cd6b42cc895d6e_Peak-logo-large-cc62c2a550.png"', '"url": "https://peak-pim.com/mirror/69b1823397cd6b42cc895d6e_Peak-logo-large-cc62c2a550.png"'],
    ['Core is $99/month or $990/year with free setup included before billing starts.', 'Core is $99/month or $990/year and includes 1,500 SKUs, 2 connected Shopify stores, 3 seats, and 100GB files. Free setup is included before billing starts.'],
    ['Elite is $249/month or $2,490/year with free setup included before billing starts.', 'Elite is $249/month or $2,490/year and includes 5,000 SKUs, 3 connected Shopify stores, 15 seats, and 500GB files. Free setup is included before billing starts.'],
    ['Enterprise is custom-priced and includes free setup plus full onboarding for larger catalogs, teams, stores, and workflows.', 'Enterprise is custom-priced with custom SKU, Shopify store, seat, and file limits. It includes free setup, full onboarding, and dedicated support.'],
    ['Yes. Every plan includes free setup and a 10-day free trial. You do not pay anything until your setup is done.', 'Yes. Every plan comes with a 10-day free trial and free setup. No credit card is required to get started.'],
    ['Can I change plans later?', 'Can I switch plans later?'],
    ['Yes. You can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.', 'Yes. You can upgrade or downgrade at any time. Changes take effect immediately and billing is adjusted accordingly.'],
    ['How does multi-store pricing work?', 'How many stores can I connect?'],
    ["All plans include multi-store support. Your plan's SKU limit applies to your total catalog across all connected stores.", 'Core includes 2 connected Shopify stores and 1,500 SKUs. Elite includes 3 connected Shopify stores and 5,000 SKUs. Enterprise limits are custom.'],
    ['Enterprise is custom-priced for large catalogs with advanced needs. It includes free setup and full onboarding for your team, catalog, stores, and workflows.', 'Enterprise plans include custom SKU limits, custom Shopify store counts, custom file storage, dedicated support, and onboarding. Pricing is tailored to your business. Contact us to discuss.'],
    ['Enterprise plans include custom SKU limits, unlimited stores, dedicated support, and onboarding. Pricing is tailored to your business. Contact us to discuss.', 'Enterprise plans include custom SKU limits, custom Shopify store counts, custom file storage, dedicated support, and onboarding. Pricing is tailored to your business. Contact us to discuss.'],
  ];

  let corrected = html;

  for (const [outdated, current] of replacements) {
    if (!corrected.includes(outdated)) {
      throw new Error(`Pricing crawler correction could not find: ${outdated}`);
    }

    corrected = corrected.replaceAll(outdated, current);
  }

  const withLiveOffers = corrected.replaceAll("https://schema.org/PreOrder", "https://schema.org/InStock");

  return replacePricingFeatureMatrix(enrichPricingStructuredData(withLiveOffers));
}

function pricingSchemaValue(value: PricingPlanValue) {
  if (value === true) return "Included";
  if (value === false) return "Not included";
  return value;
}

function pricingPlanProperties(planIndex: number) {
  return pricingFeatureGroups.flatMap((group) =>
    group.features.map((feature) => ({
      "@type": "PropertyValue",
      name: feature.label,
      description: feature.description,
      value: pricingSchemaValue(feature.values[planIndex]),
      ...(feature.href ? { propertyID: `https://peak-pim.com${feature.href}` } : {}),
    })),
  );
}

function enrichPricingStructuredData(html: string) {
  const schemaPattern = /(<script\b[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/i;
  const match = html.match(schemaPattern);

  if (!match) {
    throw new Error("The pricing structured data could not be found.");
  }

  const schema = JSON.parse(match[2]) as {
    "@type"?: string;
    featureList?: string[];
    offers?: Array<Record<string, unknown> & { name?: string }>;
  };
  const planNames = ["Core", "Elite", "Enterprise"];

  if (schema["@type"] !== "SoftwareApplication" || !Array.isArray(schema.offers)) {
    throw new Error("The pricing SoftwareApplication offers are missing.");
  }

  schema.featureList = pricingFeatureGroups.flatMap((group) => group.features.map((feature) => feature.label));

  planNames.forEach((planName, planIndex) => {
    const offer = schema.offers?.find((candidate) => candidate.name === planName);

    if (!offer) {
      throw new Error(`The pricing schema is missing the ${planName} offer.`);
    }

    offer.additionalProperty = pricingPlanProperties(planIndex);
  });

  return html.replace(
    schemaPattern,
    (_fullMatch, openingTag: string, _originalSchema: string, closingTag: string) =>
      `${openingTag}\n${JSON.stringify(schema, null, 2)}\n${closingTag}`,
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderPricingPlanValue(value: PricingPlanValue) {
  if (value === true) {
    return `<span class="pricing-feature-check" aria-label="Included"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5 9.25 17 19 7" /></svg></span>`;
  }

  if (value === false) {
    return `<span class="pricing-feature-unavailable">Not included</span>`;
  }

  if (value === "Coming soon") {
    return `<span class="pricing-feature-coming-soon">Coming soon</span>`;
  }

  return `<span>${escapeHtml(value)}</span>`;
}

function renderPricingInfo(label: string, description: string, href?: string) {
  const link = href
    ? `<a href="${escapeHtml(href)}" class="pricing-feature-popover__link">Learn more<span aria-hidden="true">&rarr;</span></a>`
    : "";

  return `<details class="pricing-feature-info"><summary aria-label="About ${escapeHtml(label)}"><svg class="pricing-feature-info__icon" viewBox="0 0 10 10" aria-hidden="true"><circle cx="5" cy="2.2" r="0.9"/><path d="M5 4.4V8"/></svg></summary><div class="pricing-feature-popover"><p>${escapeHtml(description)}</p>${link}</div></details>`;
}

function renderPricingFeatureMatrix() {
  return pricingFeatureGroups
    .map((group) => {
      const heading = `<div class="pricing54_heading-row"><div class="pricing-feature-category"><div class="pricing-feature-category__title"><span class="pricing-feature-category__marker" aria-hidden="true"></span><div class="heading-style-h6">${escapeHtml(group.label)}</div></div><p>${escapeHtml(group.description)}</p></div></div>`;
      const rows = group.features
        .map((feature) => {
          const values = feature.values
            .map((value, index) => `<div class="pricing54_row-content${index === 0 ? " is-first" : ""}">${renderPricingPlanValue(value)}</div>`)
            .join("");

          const badge = feature.badge ? `<span class="feature-status-badge">${escapeHtml(feature.badge)}</span>` : "";
          return `<div class="w-layout-grid pricing54_row"><div class="pricing54_feature"><div class="pricing-feature-name"><span>${escapeHtml(feature.label)}</span>${badge}${renderPricingInfo(feature.label, feature.description, feature.href)}</div></div>${values}</div>`;
        })
        .join("");

      return heading + rows;
    })
    .join("");
}

function replacePricingFeatureMatrix(html: string) {
  const startMarker = '<div class="pricing54_heading-row"><div class="heading-style-h6">Data</div></div>';
  const endMarker = '</div></div></div></div></div></section><section class="section_faq1';
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker, start);

  if (start === -1 || end === -1) {
    throw new Error("The pricing feature matrix could not be reorganized.");
  }

  return html.slice(0, start) + renderPricingFeatureMatrix() + html.slice(end);
}

function removePricingFeature(html: string, planCardStart: string, label: string) {
  const planIndex = html.indexOf(planCardStart);
  const labelHtml = `<div>${label}</div></div>`;
  const labelIndex = html.indexOf(labelHtml, planIndex);
  const featureIndex = html.lastIndexOf('<div id="', labelIndex);
  const featureOpeningTagEnd = html.indexOf(">", featureIndex);

  if (planIndex === -1 || labelIndex === -1 || featureIndex < planIndex || !html.slice(featureIndex, featureOpeningTagEnd).includes('class="pricing29_feature"')) {
    throw new Error(`The outdated Enterprise feature could not be removed: ${label}`);
  }

  return html.slice(0, featureIndex) + html.slice(labelIndex + labelHtml.length);
}

export function getSharedHeaderHtml() {
  return sharedHeaderHtml;
}

export function getSharedGlobalStylesHtml() {
  return sharedGlobalStylesHtml;
}

export function getSharedFooterHtml() {
  return sharedFooterHtml;
}

export function getSharedLogoBannerHtml() {
  return sharedLogoBannerHtml;
}

function extractMain(html: string) {
  const main = firstMatch(html, /<main class="main-wrapper">[\s\S]*?<\/main>/);

  if (!main) {
    return innerMatch(html, /<body[^>]*>([\s\S]*?)<\/body>/i)
      .replace(sharedHeaderHtml, "")
      .replace(sharedFooterHtml, "");
  }

  return main;
}

function cleanHead(headHtml: string) {
  return headHtml
    .replace(/<style>html\{font-family:[\s\S]*?<\/style>/, "")
    .replace(/<link href="\/mirror\/local-fonts\.css" rel="stylesheet" type="text\/css">/, "")
    .replace(/<script\b[^>]*\bsrc=["']\/mirror\/webfont-[^"']+\.js["'][^>]*><\/script>/i, "");
}

function ensurePrimaryHeading(mainHtml: string, page: PageDefinition) {
  if (!page.h1 || /<h1\b/i.test(mainHtml)) {
    return mainHtml;
  }

  return mainHtml.replace(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/i, "<h1$1>$2</h1>");
}
