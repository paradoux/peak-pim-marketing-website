import { pagesBySlug, type PageDefinition } from "../data/pages";

const pageModules = import.meta.glob<string>("../content/recreated-pages/*.html", {
  eager: true,
  query: "?raw",
  import: "default",
});

const homeHtml = pageModules["../content/recreated-pages/index.html"];

function firstMatch(html: string, pattern: RegExp) {
  return html.match(pattern)?.[0] ?? "";
}

function innerMatch(html: string, pattern: RegExp) {
  return html.match(pattern)?.[1] ?? "";
}

const sharedHeaderHtml = firstMatch(
  homeHtml,
  /<div data-animation="default" class="navbar12_component[\s\S]*?<main class="main-wrapper">/,
).replace(/<main class="main-wrapper">$/, "");

const sharedGlobalStylesHtml = firstMatch(homeHtml, /<div class="global-styles">[\s\S]*?<\/div><\/div>/);

const sharedFooterHtml = firstMatch(homeHtml, /<footer class="footer1_component"[\s\S]*?<\/footer>/);

export function getPage(slug = "") {
  return pagesBySlug.get(slug);
}

export function getPageDocument(page: PageDefinition) {
  const sourceHtml = pageModules[`../content/recreated-pages/${page.source}`];

  if (!sourceHtml) {
    throw new Error(`Missing recreated page source: ${page.source}`);
  }

  const html = applyContentCorrections(sourceHtml, page);

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
  if (page.slug === "pricing") {
    return improvePricingCrawlerContent(html);
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
  const outdatedMultiStorePlanAnswer = "Yes. Every Peak PIM plan supports multiple stores. The number of stores you can connect scales with your plan — from 2 stores on Core up to unlimited on Enterprise.";
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

  return corrected.replaceAll("https://schema.org/PreOrder", "https://schema.org/InStock");
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
