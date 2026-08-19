import { pagesBySlug, type PageDefinition } from "../data/pages";
import { normalizeCtaCopyInHtml } from "../data/cta-copy";
import { pricingFeatureGroups, pricingPlans, type PricingPlan, type PricingPlanValue } from "../data/pricing-feature-matrix";
import { featureNavigationGroups } from "../data/site-navigation";
import { assets } from "../data/assets";

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

const sharedLogoBannerTitle = "Trusted by 50+ top merchants worldwide";
const sharedLogoDetails = [
  { source: "Tupperware-White-logo", optimizedSrc: assets.customerLogos.banner.tupperware, width: 145, height: 64, slug: "tupperware", name: "Tupperware", href: "https://www.tupperware.com/fr" },
  { source: "Mae-li-White-logo", optimizedSrc: assets.customerLogos.banner.maeli, width: 123, height: 54, slug: "maeli", name: "Maéli Paris", href: "https://maeliparis.com/" },
  { source: "Artefact-White-logo", optimizedSrc: assets.customerLogos.banner.artefact, width: 156, height: 69, slug: "artefact", name: "Artefact", href: "https://www.artefact.com/" },
  { source: "Du-Bruit-Dans-La-Cuisine", optimizedSrc: assets.customerLogos.banner.duBruit, width: 141, height: 62, slug: "du-bruit", name: "Du Bruit dans la Cuisine", href: "https://www.dubruitdanslacuisine.fr/" },
  { source: "LAFAURIE-White-logo", optimizedSrc: assets.customerLogos.banner.lafaurie, width: 145, height: 64, slug: "lafaurie", name: "Lafaurie", href: "https://lafaurieparis.com/" },
  { source: "/assets/customer-logos/jatni-labs.webp", optimizedSrc: assets.customerLogos.banner.gullyLabs, width: 145, height: 45, slug: "jatni-labs", name: "Gully Labs", href: "https://gullylabs.com/" },
  { source: "/assets/customer-logos/waterdrop.webp", optimizedSrc: assets.customerLogos.banner.waterdrop, width: 145, height: 76, slug: "waterdrop", name: "waterdrop", href: "https://www.waterdrop.com/" },
  { source: "/assets/customer-logos/naked-wolfe.png", optimizedSrc: assets.customerLogos.banner.nakedWolfe, width: 145, height: 57, slug: "naked-wolfe", name: "Naked Wolfe", href: "https://nakedwolfe.com/" },
  { source: "/assets/customer-logos/lillicoco.png", optimizedSrc: assets.customerLogos.banner.lillicoco, width: 145, height: 45, slug: "lillicoco", name: "Lillicoco", href: "https://www.lillicoco.com/" },
  { source: "/assets/customer-logos/what-matters.png", optimizedSrc: assets.customerLogos.banner.whatMatters, width: 145, height: 95, slug: "what-matters", name: "What Matters", href: "https://what-matters.fr/" },
] as const;
const supplementalLogoBannerHtml = [
  `<div class="logo2_wrapper"><img width="145" height="64" alt="Lafaurie" src="${assets.customerLogos.banner.lafaurie}" loading="lazy" class="logo2_logo logo2_logo--lafaurie"></div>`,
  `<div class="logo2_wrapper"><img width="145" height="45" alt="Gully Labs" src="${assets.customerLogos.banner.gullyLabs}" loading="lazy" class="logo2_logo logo2_logo--jatni-labs"></div>`,
  `<div class="logo2_wrapper"><img width="145" height="76" alt="Waterdrop" src="${assets.customerLogos.banner.waterdrop}" loading="lazy" class="logo2_logo logo2_logo--waterdrop"></div>`,
  `<div class="logo2_wrapper"><img width="145" height="57" alt="Naked Wolfe" src="${assets.customerLogos.banner.nakedWolfe}" loading="lazy" class="logo2_logo logo2_logo--transparent-source logo2_logo--naked-wolfe"></div>`,
  `<div class="logo2_wrapper"><img width="145" height="45" alt="Lillicoco" src="${assets.customerLogos.banner.lillicoco}" loading="lazy" class="logo2_logo logo2_logo--transparent-source logo2_logo--lillicoco"></div>`,
  `<div class="logo2_wrapper"><img width="145" height="95" alt="What Matters" src="${assets.customerLogos.banner.whatMatters}" loading="lazy" class="logo2_logo logo2_logo--transparent-source logo2_logo--what-matters"></div>`,
].join("");

function findSharedLogo(tag: string) {
  return sharedLogoDetails.find(({ source, optimizedSrc }) => tag.includes(source) || tag.includes(optimizedSrc));
}

function addSharedLogoModifiers(html: string) {
  return html.replace(/<img\b[^>]*>/g, (tag) => {
    const logo = findSharedLogo(tag);

    if (!logo) return tag;

    const modifierClass = `logo2_logo--${logo.slug}`;
    const classMatch = tag.match(/class="([^"]*)"/);
    const withSource = tag
      .replace(/\s+srcset="[^"]*"/g, "")
      .replace(/\s+sizes="[^"]*"/g, "")
      .replace(/\s+src="[^"]*"/, ` src="${logo.optimizedSrc}"`)
      .replace(/\s+width="[^"]*"/, ` width="${logo.width}"`)
      .replace(/\s+height="[^"]*"/, "")
      .replace(/>$/, ` height="${logo.height}">`);
    const withAlt = /\balt="[^"]*"/.test(withSource)
      ? withSource.replace(/\balt="[^"]*"/, `alt="${logo.name}"`)
      : withSource.replace(/>$/, ` alt="${logo.name}">`);

    if (classMatch) {
      const classes = new Set(classMatch[1].split(/\s+/).filter(Boolean));
      classes.add("logo2_logo");
      classes.add(modifierClass);
      return withAlt.replace(classMatch[0], `class="${Array.from(classes).join(" ")}"`);
    }

    return withAlt.replace(/>$/, ` class="logo2_logo ${modifierClass}">`);
  });
}

function linkSharedLogos(html: string) {
  return html.replace(/(<div\b[^>]*class="logo2_wrapper"[^>]*>)(<img\b[^>]*>)(<\/div>)/g, (wrapper, opening, image, closing) => {
    const logo = findSharedLogo(image);

    if (!logo || image.includes('class="logo2_link"')) return wrapper;

    return `${opening}<a href="${logo.href}" target="_blank" rel="nofollow noopener" aria-label="Visit ${logo.name} website" class="logo2_link">${image}</a>${closing}`;
  });
}

function updateSharedLogoBanner(html: string) {
  const withTitle = addSharedLogoModifiers(
    html.replace(
      '<h2 class="heading-style-h6">Already trusted by top merchants</h2>',
      `<h2 class="heading-style-h6">${sharedLogoBannerTitle}</h2>`,
    ),
  );

  const withEveryLogo = (
    ['alt="Lafaurie"', 'alt="Gully Labs"', 'alt="Waterdrop"', 'alt="Naked Wolfe"', 'alt="Lillicoco"', 'alt="What Matters"']
      .every((logo) => withTitle.includes(logo))
  ) ? withTitle : withTitle.replace(
    /(<div[^>]*class="logo2_wrapper"[^>]*><img[^>]*alt="Du Bruit dans la Cuisine"[^>]*><\/div>)/,
    `$1${supplementalLogoBannerHtml}`,
  );

  return linkSharedLogos(addSharedLogoModifiers(withEveryLogo));
}

const sharedHeaderHtml = normalizeCtaCopyInHtml(
  firstMatch(
    homeHtml,
    /<div data-animation="default" class="navbar12_component[\s\S]*?<main class="main-wrapper">/,
  ).replace(/<main class="main-wrapper">$/, ""),
);

const sharedGlobalStylesHtml = firstMatch(homeHtml, /<div class="global-styles">[\s\S]*?<\/div><\/div>/);

const sharedFooterHtml = normalizeCtaCopyInHtml(firstMatch(homeHtml, /<footer class="footer1_component"[\s\S]*?<\/footer>/));
const sharedLogoBannerHtml = updateSharedLogoBanner(
  firstMatch(homeHtml, /<section class="section_logo2 color-scheme-2">[\s\S]*?<\/section>/),
);
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
  html = correctMismatchedComparisonSchema(html, page);
  html = updateComparisonEntryPricing(html, page);

  if (page.slug === "") {
    return improveHomepagePricingPreview(updateSharedLogoBanner(html));
  }

  if (page.slug === "mission") {
    return improveMissionPage(html);
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
  const offerListPattern = /"offers": \[[\s\S]*?\n    \],\n    "featureList":/;
  const scalePlanFaqAnswer = "It depends on your plan. Core supports 2 stores, Elite supports 5, Scale supports 8, and Enterprise supports unlimited stores. You can connect additional stores at any time from your Peak PIM dashboard.";
  const currentPlanFaqAnswer = "Basic supports 1 store, Core supports 2, and Elite supports 3. Need more? Contact us about an Enterprise plan.";
  const outdatedMultiStorePlanAnswer = "Yes. Every Peak PIM plan supports multiple stores. The number of stores you can connect scales with your plan: from 2 stores on Core up to unlimited on Enterprise.";
  const outdatedVisibleMultiStorePlanAnswer = "Yes. Every Peak PIM plan supports multiple stores. The number of stores you can connect scales with your plan. From 2 stores on Core up to unlimited on Enterprise.";
  const currentMultiStorePlanAnswer = "Basic includes 1 connected Shopify store, Core includes 2, and Elite includes 3. For additional stores, contact us about an Enterprise plan.";
  const scalePlanCardIndex = html.indexOf(scalePlanCardStart);
  const enterprisePlanCardIndex = html.indexOf(enterprisePlanCardStart, scalePlanCardIndex);

  if (scalePlanCardIndex === -1 || enterprisePlanCardIndex === -1 || !offerListPattern.test(html) || !html.includes(scalePlanFaqAnswer)) {
    throw new Error("The retired Scale plan content could not be removed from the multi-store page.");
  }

  const currentOffers = pricingPlans.map((plan) => ({
    "@type": "Offer",
    name: plan.name,
    description: pricingOfferDescription(plan),
    ...(plan.name === "Enterprise" ? {} : {
      price: planPriceNumber(plan.monthlyPrice),
      priceCurrency: "USD",
    }),
    availability: "https://schema.org/InStock",
    url: "https://peak-pim.com/pricing/",
  }));
  const withoutScalePlanCard = html.slice(0, scalePlanCardIndex) + html.slice(enterprisePlanCardIndex);
  const withCurrentLimits = withoutScalePlanCard
    .replace(offerListPattern, `"offers": ${JSON.stringify(currentOffers, null, 6)},\n    "featureList":`)
    .replaceAll(scalePlanFaqAnswer, currentPlanFaqAnswer)
    .replaceAll(outdatedMultiStorePlanAnswer, currentMultiStorePlanAnswer)
    .replaceAll(outdatedVisibleMultiStorePlanAnswer, currentMultiStorePlanAnswer)
    .replace('"description": "Unlimited Shopify stores, Custom SKU limits, Custom media storage, Metaobjects, Translations, Account manager"', '"description": "Custom Shopify stores, Custom SKU limits, Custom file storage, Dedicated support"')
    .replaceAll("Up to 1,500 SKUs", "Unlimited SKUs (fair usage)")
    .replaceAll("Up to 5,000 SKUs", "Unlimited SKUs (fair usage)")
    .replaceAll("20 GB media library", "Unlimited file storage (fair usage)")
    .replaceAll("Up to 5 Shopify stores", "Up to 3 Shopify stores")
    .replaceAll("150 GB media library", "Unlimited file storage (fair usage)")
    .replaceAll("Unlimited Shopify stores", "Custom Shopify stores")
    .replaceAll("Custom media storage", "Custom file storage")
    .replaceAll("Account manager", "Dedicated support");

  return removePricingFeature(removePricingFeature(withCurrentLimits, enterprisePlanCardStart, "Metaobjects"), enterprisePlanCardStart, "Translations");
}

function updateComparisonEntryPricing(html: string, page: PageDefinition) {
  const comparisonSlugs = new Set([
    "shopify-pim-alternatives",
    "replace-your-shopify-app-stack",
    "vs/akeneo",
    "vs/catsy",
    "vs/plytix",
    "vs/quable",
    "vs/shopify-admin",
  ]);

  if (!comparisonSlugs.has(page.slug)) return html;

  return html
    .replaceAll("($99/mo vs", "($49/mo vs")
    .replaceAll("Peak PIM starts at $99 per month ($1,188 per year)", "Peak PIM starts at $49 per month ($490 per year when billed annually)")
    .replaceAll("Peak PIM starts at $99 per month", "Peak PIM starts at $49 per month")
    .replaceAll("Shopify-native PIMs connect in minutes for around $99 a month", "Shopify-native PIMs connect in minutes from $49 a month")
    .replaceAll("Shopify-native PIMs like Peak PIM start at $99 per month", "Shopify-native PIMs like Peak PIM start at $49 per month")
    .replaceAll('<div class="callout-row peak">$99/mo</div>', '<div class="callout-row peak">$49/mo</div>')
    .replaceAll('<div>Starting price</div><div class="heading-style-h6">$99/mo</div>', '<div>Starting price</div><div class="heading-style-h6">$49/mo</div>')
    .replaceAll('<div class="heading-style-h6">Core</div><div class="margin-vertical margin-xsmall"><div class="pricing50_top-row-price-wrapper"><div class="heading-style-h1">$99</div>', '<div class="heading-style-h6">Basic</div><div class="margin-vertical margin-xsmall"><div class="pricing50_top-row-price-wrapper"><div class="heading-style-h1">$49</div>')
    .replaceAll("Peak PIM's entry tier for Shopify catalogs", "Peak PIM's entry plan for Shopify catalogs")
    .replaceAll('<div class="pricing50_row-content is-first"><div>$99</div></div>', '<div class="pricing50_row-content is-first"><div>$49</div></div>')
    .replaceAll('<div class="ppim-stack-peak-cost">$99</div>', '<div class="ppim-stack-peak-cost">$49</div>');
}

function correctMismatchedComparisonSchema(html: string, page: PageDefinition) {
  const correctedPages: Record<string, { name: string; description: string; url: string }> = {
    "replace-your-shopify-app-stack": {
      name: "Shopify PIM vs app stack: one tool instead of five (2026)",
      description: "Stop juggling 5 Shopify apps for product data. Peak PIM replaces Matrixify, Metafields Guru, bulk editors, and DAM tools with one Shopify-native PIM.",
      url: "https://peak-pim.com/replace-your-shopify-app-stack/",
    },
    "vs/shopify-admin": {
      name: "Shopify admin vs PIM: when to add Peak PIM (2026)",
      description: "Shopify admin works for small catalogs. At hundreds of products with metafields, media, and multiple stores, you need a Shopify PIM. See when Peak PIM helps.",
      url: "https://peak-pim.com/vs/shopify-admin/",
    },
  };
  const correctedPage = correctedPages[page.slug];
  if (!correctedPage) return html;

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    ...correctedPage,
    isPartOf: {
      "@type": "WebSite",
      name: "Peak PIM",
      url: "https://peak-pim.com/",
    },
    about: {
      "@type": "SoftwareApplication",
      "@id": "https://peak-pim.com/#software",
      name: "Peak PIM",
    },
  };
  const jsonLdPattern = /<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>/i;

  if (!jsonLdPattern.test(html)) throw new Error(`Missing structured data on ${page.slug}.`);
  return html.replace(jsonLdPattern, `<script type="application/ld+json">${JSON.stringify(schema)}</script>`);
}

function improveMissionPage(html: string) {
  const previousTitle = "Our Mission | Peak PIM";
  const currentTitle = "Built to Last: Our Mission | Peak PIM";
  const previousDescription = "Peak PIM is fixing the missing piece in Shopify: product data management. One place to manage, enrich, and sync your entire catalog across every store.";
  const currentDescription = "Peak PIM is on a mission to give Shopify merchants control over product data. Built by the team behind SyncBase, Peak PIM is independent and profitable.";
  const previousOrganizationDescription = "Peak PIM is the product management layer Shopify is missing. One place to manage, enrich, and sync your entire catalog: across every store, without the mess.";
  const currentOrganizationDescription = "Peak PIM is an independent, profitable Shopify PIM built by the team behind SyncBase to give merchants control over product data.";
  const missionSectionPattern = /<section class="section_content7 color-scheme-1">[\s\S]*?<\/section>/;
  const missionSection = `<section class="section_content7 mission-page-copy color-scheme-1"><div class="w-embed"><style>
.mission-page-copy .mission-page-title { font-size: clamp(2.5rem, 4vw, 3rem); line-height: 1.08; }
.mission-page-copy .text-rich-text { font-size: 1.125rem; line-height: 1.55; }
.mission-page-copy .mission-small-heading { margin-top: 1.5rem; margin-bottom: .5rem; font-size: 1.5rem; line-height: 1.25; }
.mission-page-copy .mission-founder-signature { margin-top: 3rem; margin-bottom: 1.25rem; }
.mission-page-copy .mission-founder-figure { width: 100%; max-width: none; margin: 0; }
.mission-page-copy .mission-founder-photo { display: block; width: 100%; max-width: 32rem; height: auto; margin: 0; border: 1px solid var(--border-color--border-primary, #d8d4cc); border-radius: 1.25rem; object-fit: cover; box-shadow: 0 14px 40px rgba(19, 19, 19, .08); }
@media screen and (max-width: 767px) {
  .mission-page-copy .mission-page-title { font-size: 2.25rem; }
  .mission-page-copy .text-rich-text { font-size: 1rem; }
  .mission-page-copy .mission-small-heading { margin-top: 1.25rem; margin-bottom: .4rem; font-size: 1.375rem; }
  .mission-page-copy .mission-founder-photo { border-radius: 1rem; }
}
</style></div><div class="padding-global"><div class="container-large"><div class="padding-section-large"><div class="content7_component"><div class="max-width-large align-center"><div class="content7_content-wrapper"><div class="margin-bottom margin-small"><h1 id="w-node-_3966a95b-603b-30a2-4c89-71b26fd2f4f5-08d220d8" class="heading-style-h3 mission-page-title">We are on a mission</h1></div><div class="text-rich-text w-richtext"><p>Shopify is one of the most powerful platforms ever built for merchants.</p><p>Setting up a store, managing payments, running campaigns and everything else. Shopify handles all of it beautifully. It is why millions of brands run on it.</p><h2 class="mission-small-heading">The problem we are fixing</h2><p>But product data? That is a different story.</p><p>Merchants spend hours every week wrestling with spreadsheets, copying information between apps, and fixing descriptions that somehow got out of sync between stores. Titles are wrong on one store. Images are missing on another. Variants do not match. It never ends.</p><p>All this time lost managing product chaos is time not spent building the brand, launching new products, or growing sales. <strong>So we are fixing it.</strong></p><h2 class="mission-small-heading">What we are building</h2><p>Peak PIM is the product management layer Shopify is missing. One place to manage, enrich, and publish an entire catalog across every store, without the mess.</p><p>Our goal is simple: give every Shopify merchant full control over their product data, without the complexity of enterprise tools built for someone else.</p><p><strong>More clarity. More control. More time to focus on what actually moves the business forward.</strong></p><h2 class="mission-small-heading">Built from experience</h2><p>This mission is also shaping the company we are building.</p><p>We have been part of the Shopify ecosystem for years. Before Peak PIM, we built SyncBase, and we still run it today. It has grown into the world’s leading integration between Shopify and Airtable.</p><p>Building and operating SyncBase taught us that launching a product is only the beginning. The real work is making it dependable, supporting the people who rely on it, and improving it year after year. We are bringing that same commitment to Peak PIM.</p><h2 class="mission-small-heading">Independent by design</h2><p>We made another deliberate choice: we have not raised outside funding. Peak PIM is profitable.</p><p>We are building at the pace of a durable company, not around fundraising announcements or an investor timetable. We do not need to burn cash to justify a valuation or depend on the next round to keep going. Our independence lets us make patient decisions around the product, the mission, and the merchants we serve.</p><h2 class="mission-small-heading">Driven by the mission</h2><p>We care deeply about this work. We have put years of thought, time, and effort into understanding how merchants manage product data, and we are passionate about turning that work into a tool they genuinely enjoy using every day.</p><p><strong>We intend to keep building it for the next decade and beyond.</strong></p><p class="mission-founder-signature">Axel and Théau<br>Co-founders of Peak PIM</p><figure class="mission-founder-figure"><img class="mission-founder-photo" src="/assets/team/peak-pim-founders-tech-for-retail.jpg" alt="Axel and Théau, co-founders of Peak PIM, at Tech for Retail" width="1400" height="1027" loading="lazy"></figure></div></div></div></div></div></div></div></div></section>`;

  if (!html.includes(previousTitle) || !html.includes(previousDescription) || !html.includes(previousOrganizationDescription) || !missionSectionPattern.test(html)) {
    throw new Error("The Mission page could not be upgraded with the long-term company story.");
  }

  return html
    .replaceAll(previousTitle, currentTitle)
    .replaceAll(previousDescription, currentDescription)
    .replaceAll(previousOrganizationDescription, currentOrganizationDescription)
    .replace('"url": "/mission"', '"url": "https://peak-pim.com/mission/"')
    .replace(missionSectionPattern, missionSection);
}

function basicPlanValue(label: string) {
  const feature = pricingFeatureGroups.flatMap((group) => group.features).find((candidate) => candidate.label === label);

  if (!feature) {
    throw new Error(`The Basic plan is missing its ${label} pricing value.`);
  }

  return pricingSchemaValue(feature.values[0]);
}

function renderHomepagePricingFeature(label: string) {
  return `<div class="pricing2_feature"><div class="pricing2_feature-icon-wrapper"><div class="icon-embed-xsmall w-embed"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M20.3479 7.56384L9.7479 18.1638C9.65402 18.2585 9.52622 18.3117 9.3929 18.3117C9.25958 18.3117 9.13178 18.2585 9.0379 18.1638L3.6479 12.7738C3.55324 12.68 3.5 12.5522 3.5 12.4188C3.5 12.2855 3.55324 12.1577 3.6479 12.0638L4.3479 11.3638C4.44178 11.2692 4.56958 11.2159 4.7029 11.2159C4.83622 11.2159 4.96402 11.2692 5.0579 11.3638L9.3879 15.6938L18.9379 6.14384C19.1357 5.95205 19.4501 5.95205 19.6479 6.14384L20.3479 6.85384C20.4426 6.94772 20.4958 7.07552 20.4958 7.20884C20.4958 7.34216 20.4426 7.46995 20.3479 7.56384Z" fill="currentColor"></path></svg></div></div><div>${escapeHtml(label)}</div></div>`;
}

function improveHomepagePricingPreview(html: string) {
  const incorrectCta = '<a data-open-crisp="" href="/pricing" class="button is-secondary is-alternate w-button">See pricing</a>';
  const correctedCta = '<a href="/pricing/" class="button is-secondary is-alternate w-button">See pricing</a>';
  const pricingSectionPattern = /<section class="section_pricing2 color-scheme-1">[\s\S]*?<\/section>/;
  const pricingSection = html.match(pricingSectionPattern)?.[0];
  const currentFeatureLabels = [
    "1-click onboarding",
    "Up to 1,500 SKUs",
    "Collections",
    "Metafields",
    "Files (20GB)",
    "Bulk edit",
    "Shopify Sync",
    "Priority support",
  ];
  const currentPlanLabels = ["Start from", "Included in the $99&nbsp;plan"];
  const basicFeatureLabels = [
    "1-click setup",
    `${basicPlanValue("Connected Shopify stores")} connected Shopify store`,
    "Unlimited SKUs (fair usage)",
    "Unlimited file storage (fair usage)",
    "Bulk edit",
    "Import & export",
    "Shopify sync",
    "AI Connector (MCP)",
    "Drops (scheduled changes)",
  ];

  if (
    !pricingSection
    || !pricingSection.includes(incorrectCta)
    || !currentFeatureLabels.every((label) => pricingSection.includes(`>${label}</div>`))
    || !currentPlanLabels.every((label) => pricingSection.includes(`>${label}</div>`))
  ) {
    throw new Error("The homepage pricing preview could not be aligned with the Basic plan.");
  }

  let updatedPricingSection = pricingSection
    .replace("starting at $99/mo.", "starting at $49/mo.")
    .replace(">Start from</div>", ">Basic plan</div>")
    .replace('<div class="heading-style-h1">$99</div>', '<div class="heading-style-h1">$49</div>')
    .replace(">Included in the $99&nbsp;plan</div>", ">Included in Basic</div>")
    .replace(incorrectCta, correctedCta);

  updatedPricingSection = updatedPricingSection.replace(
    /<div class="pricing2_feature-list">[\s\S]*?(?=<\/div><div class="margin-top margin-medium">)/,
    `<div class="pricing2_feature-list">${basicFeatureLabels.map(renderHomepagePricingFeature).join("")}`,
  );

  const withVisiblePricing = html
    .replace(pricingSectionPattern, updatedPricingSection)
    .replaceAll(
      "Your plan determines store limits. The Starter plan supports up to 5 stores. Higher tiers unlock more stores and advanced features. You can upgrade anytime as your business grows.",
      "Basic includes 1 connected Shopify store, Core includes 2, and Elite includes 3. Enterprise store limits are custom.",
    )
    .replaceAll(
      "We're currently in beta, and beta testers get special pricing. Join the beta to access Peak PIM at a reduced rate while we refine the product.",
      "Yes. Every plan comes with a 10-day free trial. No credit card is required to get started.",
    );

  return improveHomepagePricingStructuredData(withVisiblePricing, basicFeatureLabels.map((label) => label.replace("&amp;", "&")));
}

function improveHomepagePricingStructuredData(html: string, basicFeatureLabels: string[]) {
  const schemaPattern = /(<script\b[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/i;
  const match = html.match(schemaPattern);

  if (!match) {
    throw new Error("The homepage pricing structured data could not be found.");
  }

  const schema = JSON.parse(match[2]) as {
    "@type"?: string;
    url?: string;
    offers?: { availability?: string; name?: string; price?: string; priceSpecification?: { price?: string } };
    featureList?: string[];
    mainEntity?: {
      "@type"?: string;
      mainEntity?: Array<{
        name?: string;
        acceptedAnswer?: { text?: string };
      }>;
    };
  };

  if (schema["@type"] !== "SoftwareApplication" || !schema.offers || !schema.mainEntity?.mainEntity) {
    throw new Error("The homepage SoftwareApplication pricing schema is incomplete.");
  }

  schema.url = "https://peak-pim.com/";
  schema.offers.availability = "https://schema.org/InStock";
  schema.offers.name = "Basic";
  schema.offers.price = "49";
  if (schema.offers.priceSpecification) schema.offers.priceSpecification.price = "49";
  schema.featureList = basicFeatureLabels;

  const storeQuestion = schema.mainEntity.mainEntity.find((question) => question.name === "How many stores can I manage?");
  const trialQuestion = schema.mainEntity.mainEntity.find((question) => question.name === "Is there a free trial?");

  if (!storeQuestion?.acceptedAnswer || !trialQuestion?.acceptedAnswer) {
    throw new Error("The homepage pricing FAQ schema could not be aligned with the current plans.");
  }

  storeQuestion.acceptedAnswer.text = "Basic includes 1 connected Shopify store, Core includes 2, and Elite includes 3. Enterprise store limits are custom.";
  trialQuestion.acceptedAnswer.text = "Yes. Every plan comes with a 10-day free trial. No credit card is required to get started.";

  return html.replace(schemaPattern, `${match[1]}\n${JSON.stringify(schema, null, 2)}\n${match[3]}`);
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
    ['Yes. Every plan includes free setup and a 10-day free trial. You do not pay anything until your setup is done.', 'Yes. Every plan comes with a 10-day free trial and free setup. No credit card is required to get started.'],
    ['Can I change plans later?', 'Can I switch plans later?'],
    ['Yes. You can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.', 'Yes. You can upgrade or downgrade at any time. Changes take effect immediately and billing is adjusted accordingly.'],
    ['How does multi-store pricing work?', 'How many stores can I connect?'],
    ["All plans include multi-store support. Your plan's SKU limit applies to your total catalog across all connected stores.", 'Basic includes 1 connected Shopify store, Core includes 2, and Elite includes 3. Enterprise store limits are custom.'],
    ['Enterprise is custom-priced for large catalogs with advanced needs. It includes free setup and full onboarding for your team, catalog, stores, and workflows.', 'Enterprise plans include custom store, seat, update, SKU, and file limits, plus dedicated support and onboarding. Pricing is tailored to your business.'],
    ['Core supports 2 stores and Elite supports 3. Need more? Contact us about an Enterprise plan.', 'Basic supports 1 store, Core supports 2, and Elite supports 3. Need more? Contact us about an Enterprise plan.'],
    ['Yes. Paying annually saves you 2 months compared to monthly billing. Core is $990/year and Elite is $2,490/year. Enterprise billing is tailored to your agreement.', 'Yes. Paying annually saves you 2 months compared to monthly billing. Basic is $490/year, Core is $990/year, and Elite is $2,490/year. Enterprise billing is tailored to your agreement.'],
    ['What happens if I exceed my SKU limit?', 'Are SKUs and file storage capped?'],
    ["We'll let you know before you hit the limit. You can upgrade your plan at any time to unlock higher SKU limits without losing any of your data.", 'Self-serve plans do not have fixed SKU or file-storage caps. They are covered by fair usage so normal catalog growth is not penalized. We will contact you if exceptional usage requires an Enterprise plan.'],
    ['Enterprise plans include custom SKU limits, unlimited stores, dedicated support, and onboarding. Pricing is tailored to your business. Contact us to discuss.', 'Enterprise plans include custom store, seat, update, SKU, and file limits, plus dedicated support and onboarding. Pricing is tailored to your business.'],
  ];

  let corrected = html;

  for (const [outdated, current] of replacements) {
    if (!corrected.includes(outdated)) {
      throw new Error(`Pricing crawler correction could not find: ${outdated}`);
    }

    corrected = corrected.replaceAll(outdated, current);
  }

  const withCurrentMetadata = corrected
    .replaceAll("Peak PIM pricing starts at $99/mo with free setup, a 10-day trial, and 2 months free annually. Core, Elite, and Enterprise plans for Shopify teams.", "Peak PIM pricing starts at $49/mo with free setup, a 10-day trial, and 2 months free annually. Compare Basic, Core, Elite, and Enterprise plans.")
    .replaceAll("Peak PIM pricing starts at $99/mo with free setup, a 10-day trial, and 2 months free annually. Enterprise includes full onboarding.", "Peak PIM pricing starts at $49/mo with free setup, a 10-day trial, and fair-use SKUs and files. Enterprise includes full onboarding.")
    .replaceAll("https://schema.org/PreOrder", "https://schema.org/InStock");

  return replacePricingFeatureMatrix(
    replacePricingPlanHeaders(
      replacePricingPlanCards(enrichPricingStructuredData(withCurrentMetadata)),
    ),
  );
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

function planPriceNumber(price: string) {
  return price.replace(/[^0-9]/g, "");
}

function pricingOfferDescription(plan: PricingPlan) {
  const storeCount = pricingSchemaValue(pricingFeatureGroups[0].features[0].values[pricingPlans.indexOf(plan)]);
  const updates = pricingSchemaValue(pricingFeatureGroups[0].features[2].values[pricingPlans.indexOf(plan)]);

  if (plan.name === "Enterprise") {
    return "Enterprise is custom-priced with custom store, seat, update, SKU, and file limits, plus dedicated support and onboarding.";
  }

  return `${plan.name} is ${plan.monthlyPrice}/month or ${plan.annualPrice}/year and includes ${storeCount} connected Shopify ${storeCount === "1" ? "store" : "stores"} and ${updates} monthly updates. SKUs and file storage follow fair usage.`;
}

function enrichPricingStructuredData(html: string) {
  const schemaPattern = /(<script\b[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/i;
  const match = html.match(schemaPattern);

  if (!match) {
    throw new Error("The pricing structured data could not be found.");
  }

  const schema = JSON.parse(match[2]) as {
    "@type"?: string;
    description?: string;
    featureList?: string[];
    offers?: Array<Record<string, unknown> & { name?: string }>;
  };
  const planNames = pricingPlans.map((plan) => plan.name);

  if (schema["@type"] !== "SoftwareApplication" || !Array.isArray(schema.offers)) {
    throw new Error("The pricing SoftwareApplication offers are missing.");
  }

  schema.featureList = pricingFeatureGroups.flatMap((group) => group.features.map((feature) => feature.label));
  schema.offers = pricingPlans.map((plan, planIndex) => ({
    "@type": "Offer",
    name: plan.name,
    description: pricingOfferDescription(plan),
    ...(plan.name === "Enterprise" ? {} : {
      price: planPriceNumber(plan.monthlyPrice),
      priceCurrency: "USD",
      priceSpecification: [
        {
          "@type": "UnitPriceSpecification",
          price: planPriceNumber(plan.monthlyPrice),
          priceCurrency: "USD",
          unitText: "MONTH",
        },
        {
          "@type": "UnitPriceSpecification",
          price: planPriceNumber(plan.annualPrice),
          priceCurrency: "USD",
          unitText: "YEAR",
        },
      ],
    }),
    availability: "https://schema.org/InStock",
    additionalProperty: pricingPlanProperties(planIndex),
  }));

  schema.description = "Peak PIM pricing starts at $49 per month with four plans, fair-use SKUs and files, free setup, and a 10-day free trial.";

  const faq = (schema as { mainEntity?: { mainEntity?: Array<{ name?: string; acceptedAnswer?: { text?: string } }> } }).mainEntity?.mainEntity;
  if (faq) {
    const skuQuestion = faq.find((question) => question.name === "What counts as a SKU?");
    const storeQuestion = faq.find((question) => question.name === "How many stores can I connect?");
    const enterpriseQuestion = faq.find((question) => question.name === "What is included in Enterprise?");

    if (skuQuestion?.acceptedAnswer) {
      skuQuestion.name = "What counts as an update?";
      skuQuestion.acceptedAnswer.text = "An update is one saved record in Peak PIM or one synchronization to a connected store. Bulk actions count each affected record, and saving then publishing counts as two updates.";
    }
    if (storeQuestion?.acceptedAnswer) {
      storeQuestion.acceptedAnswer.text = "Basic includes 1 connected Shopify store, Core includes 2, and Elite includes 3. Enterprise store limits are custom.";
    }
    if (enterpriseQuestion?.acceptedAnswer) {
      enterpriseQuestion.acceptedAnswer.text = "Enterprise includes custom store, seat, update, SKU, and file limits, plus dedicated support and onboarding.";
    }
  }

  if (!planNames.every((planName) => schema.offers?.some((offer) => offer.name === planName))) {
    throw new Error("The pricing schema is missing one or more current plans.");
  }

  return html.replace(
    schemaPattern,
    (_fullMatch, openingTag: string, _originalSchema: string, closingTag: string) =>
      `${openingTag}\n${JSON.stringify(schema, null, 2)}\n${closingTag}`,
  );
}

function renderPricingPlanCard(plan: PricingPlan) {
  const isEnterprise = plan.name === "Enterprise";
  const price = isEnterprise ? "Custom" : `${plan.monthlyPrice}/mo`;
  const annual = isEnterprise ? "Custom" : `${plan.annualPrice}/yr`;
  const highlights = plan.highlights.map((highlight) => `<div class="tag">${escapeHtml(highlight)}</div>`).join("");

  return `<div class="layout401_card pricing-plan-card pricing-plan-card--${plan.name.toLowerCase()}"><div class="layout401_card-content"><div class="layout401_card-content-top"><div class="pricing-plan-card__marker" aria-hidden="true"></div><div class="margin-bottom margin-xxsmall"><h3 class="heading-style-h5">${plan.name}</h3></div><div class="pricing-plan-price"${isEnterprise ? "" : ` data-pricing-price data-monthly="${plan.monthlyPrice}/mo" data-annual="${annual}"`}>${price}</div><p>${escapeHtml(plan.summary)}</p><div class="pricing-plan-meta">${highlights}</div></div><div class="margin-top margin-small"><div class="button-group"><a href="#details" class="button is-link w-inline-block"><div>View</div></a></div></div></div></div>`;
}

function replacePricingPlanCards(html: string) {
  const pattern = /<section class="section_layout401 color-scheme-1">[\s\S]*?<\/section>/;
  const cards = pricingPlans.map(renderPricingPlanCard).join("");
  const section = `<section class="section_layout401 color-scheme-1"><div class="padding-global"><div class="container-large"><div class="padding-section-large"><div class="pricing-billing-toggle-wrap"><div class="pricing-billing-toggle" role="group" aria-label="Billing frequency"><button type="button" class="pricing-billing-option is-active" data-billing-toggle="monthly" aria-pressed="true">Monthly</button><button type="button" class="pricing-billing-option" data-billing-toggle="annual" aria-pressed="false">Annual <span>2 months free</span></button></div></div><div class="layout401_component"><div class="w-layout-grid layout401_grid-list"><div class="w-layout-grid layout401_row">${cards}</div></div></div></div></div></div></section>`;

  if (!pattern.test(html)) throw new Error("The pricing summary cards could not be rebuilt for four plans.");
  return html.replace(pattern, section);
}

function renderPricingPlanHeader(plan: PricingPlan) {
  const isEnterprise = plan.name === "Enterprise";
  const externalAttributes = ' target="_blank" rel="noopener"';
  const unitMonthly = isEnterprise ? "Tailored plan" : "Per month";
  const unitAnnual = isEnterprise ? "Tailored plan" : "Per year";
  const billingMonthly = isEnterprise ? "Built around your stores and workflows." : "Billed monthly, cancel anytime.";
  const billingAnnual = isEnterprise ? "Built around your stores and workflows." : "Billed annually, 2 months free.";

  return `<div class="pricing54_top-row-content${plan.name === "Basic" ? " is-first" : ""}"><div class="pricing54_top-row-wrapper"><div class="heading-style-h6">${plan.name}</div><div class="margin-vertical margin-xsmall"><div class="pricing54_top-row-price-wrapper"><div class="heading-style-h2" data-pricing-price data-monthly="${plan.monthlyPrice}" data-annual="${plan.annualPrice}">${plan.monthlyPrice}</div><div class="text-weight-bold" data-pricing-unit data-monthly="${unitMonthly}" data-annual="${unitAnnual}">${unitMonthly}</div></div></div><div data-pricing-billing data-monthly="${billingMonthly}" data-annual="${billingAnnual}">${billingMonthly}</div></div><div class="margin-top margin-medium"><a href="${plan.ctaHref}" class="button hide-mobile-landscape is-small w-button"${externalAttributes}>${plan.ctaLabel}</a></div></div>`;
}

function replacePricingPlanHeaders(html: string) {
  const startMarker = '<div class="w-layout-grid pricing54_top-row">';
  const endMarker = '<div class="pricing54_heading-row"><div class="heading-style-h6">Data</div></div>';
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker, start);

  if (start === -1 || end === -1) throw new Error("The pricing comparison header could not be rebuilt for four plans.");

  const header = `${startMarker}<div class="pricing54_empty-space"></div>${pricingPlans.map(renderPricingPlanHeader).join("")}</div>`;
  return html.slice(0, start) + header + html.slice(end);
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

  if (value === "Coming soon" || value === "On request") {
    return `<span class="pricing-feature-coming-soon">${escapeHtml(value)}</span>`;
  }

  if (value === "Unlimited, fair usage") {
    return `<span class="pricing-feature-unlimited"><strong>Unlimited</strong><small>Fair usage</small></span>`;
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
