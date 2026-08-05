import { expect, test, type Page } from "@playwright/test";

const pages = [
  { name: "catalogue", path: "/design-system" },
  { name: "ai-assistant", path: "/ai-assistant" },
  { name: "bulk-edit", path: "/bulk-edit" },
  { name: "translations", path: "/shopify-pim-translations" },
  { name: "import-export", path: "/shopify-product-import-export" },
  { name: "drops", path: "/shopify-product-drops" },
  { name: "health-center", path: "/shopify-catalog-health-center" },
  { name: "history", path: "/history" },
  { name: "global-search", path: "/search" },
  { name: "ai-connector", path: "/ai-catalog-connector" },
  { name: "developer-api", path: "/api" },
  { name: "metaobjects", path: "/shopify-metaobjects" },
  { name: "metafields", path: "/shopify-metafield-management" },
  { name: "custom-fields", path: "/shopify-custom-fields" },
  { name: "roles-permissions", path: "/user-roles-permissions" },
  { name: "collections", path: "/shopify-collections" },
  { name: "markets-catalogs", path: "/shopify-markets-pricing" },
  { name: "products-variants", path: "/shopify-product-management" },
  { name: "maeli-customer-story", path: "/customers/maeli-paris" },
  { name: "carre-coco-customer-story", path: "/customers/carre-coco" },
] as const;

const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 375, height: 812 },
] as const;

async function prepare(page: Page, path: string, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await page.addStyleTag({ content: ".crisp-client { display: none !important; }" });
  await page.evaluate(() => document.fonts.ready);
}

for (const target of pages) {
  for (const viewport of viewports) {
    test(`${target.name} · ${viewport.name}`, async ({ page }) => {
      await prepare(page, target.path, viewport.width, viewport.height);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("main.main-wrapper")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
      await expect(page).toHaveScreenshot(`${target.name}-fold-${viewport.name}.png`, { animations: "disabled", fullPage: false, maxDiffPixelRatio: 0.015 });
    });
  }
}

test("homepage · hero CTA pair is responsive and uses canonical actions", async ({ page }) => {
  for (const width of [1440, 768, 375]) {
    await prepare(page, "/", width, 1000);
    const hero = page.locator(".section_landing-big_hero-header");
    const announcement = hero.locator(".ppim-home-pill-wrap");
    await expect(announcement).toContainText("Connect your catalog to AI assistants with MCP");
    await expect(announcement).toHaveAttribute("href", "/ai-catalog-connector");
    await expect(announcement).not.toHaveAttribute("target", "_blank");
    const actions = hero.locator(".button-group.is-center .button");
    await expect(actions).toHaveCount(2);
    await expect(actions).toHaveText(["Try for free", "Book a demo"]);
    await expect(actions.nth(0)).toHaveAttribute("href", "https://apps.shopify.com/peak-pim");
    await expect(actions.nth(1)).toHaveAttribute("href", "https://calendar.app.google/M9DEEDbc6AxRaNNX6");
    await expect(actions.nth(1)).toHaveAttribute("target", "_blank");
    await expect(actions.nth(1)).toHaveAttribute("rel", "noopener");
    await expect(actions.nth(1)).not.toHaveAttribute("data-open-crisp", "");
    await expect(actions.nth(0)).toBeVisible();
    await expect(actions.nth(1)).toBeVisible();
    const pricingPreviewCta = page.getByRole("link", { name: "See pricing", exact: true });
    await expect(pricingPreviewCta).toHaveCount(1);
    await expect(pricingPreviewCta).toHaveAttribute("href", "/pricing/");
    await expect(pricingPreviewCta).not.toHaveAttribute("data-open-crisp", "");
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);

    if (width === 1440) {
      await pricingPreviewCta.click();
      await expect(page).toHaveURL(/\/pricing\/$/);
    }
  }
});

test("homepage · pricing preview matches the current Core plan", async ({ page }) => {
  for (const width of [1440, 375]) {
    await prepare(page, "/", width, 1000);
    const pricing = page.locator(".section_pricing2");

    await expect(pricing).toContainText("Core plan");
    await expect(pricing).toContainText("$99");
    await expect(pricing.locator(".pricing2_feature")).toHaveText([
      "1-click setup",
      "2 connected Shopify stores",
      "3 team seats",
      "Up to 1,500 SKUs",
      "100GB file storage",
      "Bulk edit",
      "Import & export",
      "Shopify sync",
    ]);
    await expect(pricing).not.toContainText("20GB");
    await expect(pricing).not.toContainText("Priority support");
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  }
});

test("homepage · Maéli Paris customer story sits between pricing and the final CTA", async ({ page }) => {
  for (const viewport of [
    { name: "desktop", width: 1440, height: 1000 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "mobile", width: 375, height: 812 },
  ]) {
    await prepare(page, "/", viewport.width, viewport.height);
    const story = page.locator(".peak-customer-story-hero");
    const socialProof = page.locator(".peak-social-proof-stats");

    await expect(story.locator("h2")).toHaveText("How Maéli Paris gets hours back every week");
    await expect(story.locator("img").first()).toHaveAttribute("alt", "Maéli Paris");
    await expect(story.locator(".peak-customer-story-hero__image")).toHaveAttribute("src", "/assets/testimonials/amelie-samson-maeli-paris.webp");
    await expect(story.getByRole("link", { name: "See use case" })).toHaveAttribute("href", "/customers/maeli-paris/");
    await expect(socialProof).toContainText("50+");
    await expect(socialProof).toContainText("210+");
    await expect(socialProof).toContainText("455,000");
    await expect(socialProof).not.toContainText("Proven in real catalog workflows");
    await expect(socialProof).not.toContainText("Already operating their catalogs with Peak PIM.");
    await expect(socialProof.locator(".peak-social-proof-stats__logo-link")).toHaveCount(6);
    expect(await socialProof.locator(".peak-social-proof-stats__logo-link").evaluateAll((links) => links.every((link) => (
      link.getAttribute("target") === "_blank" && link.getAttribute("rel") === "nofollow noopener"
    )))).toBe(true);

    const sectionOrder = await page.locator(".section_layout121, .peak-social-proof-stats, .section_pricing2, .peak-customer-story-hero, .section_cta51").evaluateAll((sections) =>
      sections.map((section) => Array.from(section.classList).find((className) => ["section_layout121", "peak-social-proof-stats", "section_pricing2", "peak-customer-story-hero", "section_cta51"].includes(className))),
    );
    expect(sectionOrder).toEqual(["section_layout121", "peak-social-proof-stats", "section_pricing2", "peak-customer-story-hero", "section_cta51"]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  }
});

test("account proof · approved product, scale, comparison, and fashion pages reuse the shared section", async ({ page }) => {
  for (const placement of [
    { path: "/shopify-product-management/", before: ".peak-feature-grid", after: "#start" },
    { path: "/shopify-multi-store-pim/", before: ".section_comparison14", after: ".section_pricing29" },
    { path: "/build-vs-buy-pim/", before: "#comparison", after: "#pricing-comparison" },
    { path: "/industry/fashion/", before: ".section_faq1", after: ".section_cta51" },
  ]) {
    await prepare(page, placement.path, 1440, 1000);
    const proof = page.locator(".peak-social-proof-stats");

    await expect(proof).toHaveCount(1);
    await expect(proof).toContainText("50+");
    await expect(proof).toContainText("210+");
    await expect(proof).toContainText("455,000");
    await expect(proof.locator(".peak-social-proof-stats__logo-link")).toHaveCount(6);

    const orderIsCorrect = await page.evaluate(({ before, after }) => {
      const beforeElement = document.querySelector(before);
      const proofElement = document.querySelector(".peak-social-proof-stats");
      const afterElement = document.querySelector(after);
      return Boolean(
        beforeElement
        && proofElement
        && afterElement
        && (beforeElement.compareDocumentPosition(proofElement) & Node.DOCUMENT_POSITION_FOLLOWING)
        && (proofElement.compareDocumentPosition(afterElement) & Node.DOCUMENT_POSITION_FOLLOWING)
      );
    }, placement);

    expect(orderIsCorrect).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  }
});

test("lead modal · customer proof and trial form share one responsive layout", async ({ page }) => {
  for (const viewport of [
    { name: "desktop", width: 1440, height: 900 },
    { name: "mobile", width: 375, height: 812 },
  ]) {
    await prepare(page, "/?lead-modal=30-day-extended-trial", viewport.width, viewport.height);
    const dialog = page.locator("[data-lead-modal-root]");
    await dialog.waitFor({ state: "visible" });
    await expect(dialog.locator(".lead-modal__proof-image")).toBeVisible();
    await expect(dialog.locator(".lead-modal__proof-logo")).toBeVisible();
    await expect(dialog.locator("blockquote")).toContainText("Peak PIM saves us hours every week");
    await expect(dialog.locator("blockquote")).toContainText("opens new markets and new revenue opportunities");
    await expect(dialog.locator(".lead-modal__proof-link")).toHaveCount(0);
    await expect(dialog.locator("[data-lead-modal-title]")).toHaveText("Get your 30 days extended trial");
    await expect(dialog.locator("input[name='email']")).toBeVisible();

    const layout = await dialog.locator(".lead-modal__layout").evaluate((element) => {
      const proof = element.querySelector(".lead-modal__proof")?.getBoundingClientRect();
      const state = element.querySelector(".lead-modal__state")?.getBoundingClientRect();
      const quote = element.querySelector("blockquote");
      const attribution = element.querySelector(".lead-modal__proof-attribution")?.getBoundingClientRect();
      const quoteRect = quote?.getBoundingClientRect();
      const quoteStyle = quote ? getComputedStyle(quote) : null;
      return proof && state && attribution && quoteRect && quoteStyle ? {
        proofLeft: proof.left,
        proofTop: proof.top,
        proofRight: proof.right,
        proofBottom: proof.bottom,
        stateLeft: state.left,
        stateTop: state.top,
        attributionLeft: attribution.left,
        quoteTextLeft: quoteRect.left + parseFloat(quoteStyle.borderLeftWidth) + parseFloat(quoteStyle.paddingLeft),
        quoteBorderLeftWidth: parseFloat(quoteStyle.borderLeftWidth),
      } : null;
    });
    expect(layout).not.toBeNull();
    expect(Math.abs(layout!.attributionLeft - layout!.quoteTextLeft)).toBeLessThanOrEqual(1);
    if (viewport.name === "desktop") expect(layout!.proofRight).toBeLessThanOrEqual(layout!.stateLeft + 1);
    if (viewport.name === "desktop") expect(await dialog.locator("blockquote").evaluate((element) => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(19);
    if (viewport.name === "mobile") {
      expect(layout!.proofBottom).toBeLessThanOrEqual(layout!.stateTop + 1);
      expect(layout!.quoteBorderLeftWidth).toBe(0);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    await expect(page).toHaveScreenshot(`lead-modal-social-proof-${viewport.name}.png`, { animations: "disabled", fullPage: false, maxDiffPixelRatio: 0.015 });
  }
});

test("pricing · categorized feature matrix and accessible information controls", async ({ page }) => {
  for (const width of [1440, 768, 375]) {
    await prepare(page, "/pricing/", width, 900);
    const matrix = page.locator(".pricing54_plans");

    await expect(matrix.locator(".pricing-feature-category .heading-style-h6")).toHaveText([
      "Plan limits",
      "Connect",
      "Operate",
      "Manage & Enrich",
      "Support",
    ]);
    await expect(matrix.locator(".pricing-feature-info")).toHaveCount(34);
    await expect(matrix.locator(".pricing-feature-name")).toContainText([
      "Connected Shopify stores",
      "Seats",
      "SKUs",
      "File storage",
      "1-click setup",
      "Shopify sync",
      "Amazon sync",
      "AI Connector (MCP)",
      "API",
      "AI Assistant",
      "Multi-store management",
      "Bulk edit",
      "Import & export",
      "Media management",
      "Drops",
      "Automations",
      "Scores",
      "History",
      "Backups",
      "Global search",
      "Health Center",
      "Users & permissions",
      "Products & variants",
      "Collections",
      "Metafields",
      "Metaobjects",
      "Translations",
      "Markets & catalogs",
      "Custom fields",
      "Help Center",
      "AI agent support (24/7)",
      "Human priority support",
      "Onboarding call",
      "Dedicated account manager",
    ]);
    await expect(matrix.locator(".pricing-feature-name:has(.feature-status-badge) > span:first-child")).toHaveText([
      "AI Connector (MCP)",
      "AI Assistant",
      "Drops",
      "History",
      "Global search",
      "Health Center",
      "Markets & catalogs",
    ]);
    await expect(matrix.locator(".pricing-feature-name .feature-status-badge")).toHaveText(["New", "New", "New", "New", "New", "New", "New"]);
    await expect(matrix.locator(".pricing54_top-row-content .heading-style-h6")).toHaveText(["Core", "Elite", "Enterprise"]);
    const socialProof = page.locator(".peak-social-proof-stats");
    await expect(socialProof).toContainText("50+");
    await expect(socialProof).toContainText("210+");
    await expect(socialProof).toContainText("455,000");
    await expect(socialProof.locator(".peak-social-proof-stats__logo-link")).toHaveCount(6);
    expect(await page.evaluate(() => {
      const matrixElement = document.querySelector(".pricing54_plans");
      const proofElement = document.querySelector(".peak-social-proof-stats");
      const faqElement = document.querySelector(".section_faq1");
      return Boolean(
        matrixElement
        && proofElement
        && faqElement
        && (matrixElement.compareDocumentPosition(proofElement) & Node.DOCUMENT_POSITION_FOLLOWING)
        && (proofElement.compareDocumentPosition(faqElement) & Node.DOCUMENT_POSITION_FOLLOWING)
      );
    })).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  }

  await prepare(page, "/pricing/", 1440, 900);
  const category = page.locator(".pricing-feature-category").filter({ hasText: "Manage & Enrich" });
  const markerBox = await category.locator(".pricing-feature-category__marker").boundingBox();
  const titleBox = await category.locator(".heading-style-h6").boundingBox();
  const subtitleBox = await category.locator("p").boundingBox();
  expect(markerBox).not.toBeNull();
  expect(titleBox).not.toBeNull();
  expect(subtitleBox).not.toBeNull();
  expect(markerBox!.width).toBeGreaterThanOrEqual(10);
  expect(Math.abs(markerBox!.y + markerBox!.height / 2 - (titleBox!.y + titleBox!.height / 2))).toBeLessThanOrEqual(2);
  expect(Math.abs(subtitleBox!.y + subtitleBox!.height / 2 - (titleBox!.y + titleBox!.height / 2))).toBeLessThanOrEqual(6);
  await expect(page.locator(".pricing54_plans .pricing54_icon-wrapper svg")).toHaveCount(0);
  const infoIconBox = await page.locator('summary[aria-label="About Drops"]').boundingBox();
  expect(infoIconBox).not.toBeNull();
  expect(infoIconBox!.width).toBeGreaterThanOrEqual(13);
  expect(infoIconBox!.width).toBeLessThanOrEqual(15);

  const hoverControl = page.locator('summary[aria-label="About Drops"]');
  await hoverControl.hover();
  await expect(hoverControl.locator("xpath=..")).toHaveAttribute("open", "");
  const hoverPanel = page.locator('summary[aria-label="About Drops"] + .pricing-feature-popover');
  const hoverPanelBox = await hoverPanel.boundingBox();
  expect(hoverPanelBox).not.toBeNull();
  expect(hoverPanelBox!.x).toBeGreaterThanOrEqual(0);
  expect(hoverPanelBox!.x + hoverPanelBox!.width).toBeLessThanOrEqual(1440);
  await page.mouse.move(1200, 820);
  await page.waitForTimeout(180);
  await expect(hoverControl.locator("xpath=..")).not.toHaveAttribute("open", "");

  await prepare(page, "/pricing/", 375, 812);
  const infoControl = page.locator('summary[aria-label="About Shopify sync"]');
  await infoControl.focus();
  await infoControl.press("Enter");
  await expect(infoControl.locator("xpath=..")).toHaveAttribute("open", "");
  const infoPanel = page.locator('summary[aria-label="About Shopify sync"] + .pricing-feature-popover');
  await expect(infoPanel).toContainText("Refresh catalog data from Shopify");
  await expect(infoPanel.getByRole("link", { name: "Learn more" })).toHaveAttribute("href", "/shopify-sync");
  const panelBox = await infoPanel.boundingBox();
  expect(panelBox).not.toBeNull();
  expect(panelBox!.x).toBeGreaterThanOrEqual(0);
  expect(panelBox!.x + panelBox!.width).toBeLessThanOrEqual(375);

  for (const width of [1600, 992, 768, 375]) {
    await prepare(page, "/pricing/#details", width, 900);
    await page.evaluate(() => {
      const topRow = document.querySelector<HTMLElement>(".pricing54_top-row");
      if (topRow) window.scrollTo(0, topRow.getBoundingClientRect().top + window.scrollY + 160);
    });
    await page.waitForTimeout(100);
    const stickyLayers = await page.evaluate(() => {
      const header = document.querySelector<HTMLElement>(".site-header");
      const topRow = document.querySelector<HTMLElement>(".pricing54_top-row");
      const emptyCell = document.querySelector<HTMLElement>(".pricing54_empty-space");
      const planCell = document.querySelector<HTMLElement>(".pricing54_top-row-content");
      if (!header || !topRow || !planCell) return null;
      const alpha = (element: HTMLElement) => getComputedStyle(element).backgroundColor;
      return {
        headerBottom: header.getBoundingClientRect().bottom,
        topRowTop: topRow.getBoundingClientRect().top,
        backgrounds: [alpha(header), alpha(topRow), emptyCell ? alpha(emptyCell) : null, alpha(planCell)],
      };
    });
    expect(stickyLayers).not.toBeNull();
    expect(
      Math.abs(stickyLayers!.headerBottom - stickyLayers!.topRowTop),
      `sticky stack at ${width}px: ${JSON.stringify(stickyLayers)}`,
    ).toBeLessThanOrEqual(1);
    expect(stickyLayers!.backgrounds.filter(Boolean).every((color) => color !== "rgba(0, 0, 0, 0)" && color !== "transparent")).toBe(true);
  }
});

test("global navigation · every feature is grouped and reachable", async ({ page }) => {
  const featurePaths = [
    "/1-click-setup",
    "/shopify-sync",
    "/ai-catalog-connector",
    "/ai-assistant",
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
    "/history",
    "/search",
    "/shopify-catalog-health-center",
    "/user-roles-permissions",
    "/industry/fashion",
  ];

  for (const width of [1440, 992, 768, 560, 375]) {
    await prepare(page, "/", width, 1000);
    const header = page.locator(".site-header");
    const featureToggle = header.locator(".feature-menu-dropdown > .navbar10_dropdown-toggle");
    const customersToggle = header.locator(".customers-menu-dropdown > .navbar10_dropdown-toggle");
    const resourcesToggle = header.locator(".resources-menu-dropdown > .navbar10_dropdown-toggle");

    if (width <= 991) {
      await header.locator(".navbar10_menu-button").click();
    }

    await featureToggle.focus();
    await featureToggle.press("Enter");
    await expect(featureToggle).toHaveAttribute("aria-expanded", "true");
    await expect(header.locator(".feature-mega-menu__title")).toHaveText(["Connect", "Operate", "Manage & Enrich"]);
    expect(await header.locator(".feature-mega-menu__marker").evaluateAll((markers) => markers.every((marker) => {
      const rect = marker.getBoundingClientRect();
      return Math.abs(rect.width - rect.height) <= 0.01;
    }))).toBe(true);
    const headerLiveDemoLink = header.locator('.feature-mega-menu__demo-link[href="https://app.peak-pim.com/demo"]');
    await expect(headerLiveDemoLink).toHaveText("Live demo→");
    await expect(headerLiveDemoLink).toHaveAttribute("target", "_blank");
    await expect(headerLiveDemoLink).toHaveAttribute("rel", "noopener");
    await expect(header.locator('.feature-mega-menu__group[aria-labelledby="feature-group-connect"] .feature-mega-menu__link-title')).toHaveText([
      "1-click setup",
      "Shopify sync",
      "Amazon sync",
      "AI Connector (MCP)",
      "API",
    ]);
    await expect(header.locator('.feature-mega-menu__group[aria-labelledby="feature-group-operate"] .feature-mega-menu__link-title')).toHaveText([
      "AI Assistant",
      "Multi-store",
      "Bulk edit",
      "Import & export",
      "Media management",
      "Drops",
      "Automations",
      "Scores",
      "History",
      "Backups",
      "Global search",
      "Health Center",
      "Users & permissions",
    ]);
    await expect(header.locator(".feature-mega-menu__link.is-coming-soon .feature-mega-menu__link-title")).toHaveText(["Amazon sync", "Automations", "Scores", "Backups"]);
    expect(await header.locator(".feature-mega-menu__link.is-coming-soon").evaluateAll((elements) => elements.every((element) => !element.hasAttribute("href")))).toBe(true);
    const operateHeaderColumns = await header.locator('.feature-mega-menu__group[aria-labelledby="feature-group-operate"] .feature-mega-menu__links').evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length);
    expect(operateHeaderColumns).toBe(width >= 992 ? 2 : 1);
    if (width === 1440) {
      const dropdownFit = await header.locator(".feature-menu-dropdown__list").evaluate((element) => element.scrollHeight <= element.clientHeight + 1);
      expect(dropdownFit).toBe(true);
    }
    await expect(header.locator(".feature-mega-menu__link:has(.feature-status-badge):not(.is-coming-soon) .feature-mega-menu__link-title")).toHaveText([
      "AI Connector (MCP)",
      "AI Assistant",
      "Drops",
      "History",
      "Global search",
      "Health Center",
      "Markets & catalogs",
    ]);
    await expect(header.locator(".feature-mega-menu__link:has(.feature-status-badge):not(.is-coming-soon) .feature-status-badge")).toHaveText([
      "New",
      "New",
      "New",
      "New",
      "New",
      "New",
      "New",
    ]);

    await customersToggle.focus();
    await customersToggle.press("Enter");
    await expect(customersToggle).toHaveAttribute("aria-expanded", "true");
    await expect(featureToggle).toHaveAttribute("aria-expanded", "false");
    await expect(header.locator(".customers-mega-menu__dropdown")).toBeVisible();
    await expect(header.locator(".customers-mega-menu__section-heading")).toHaveText(["Reviews", "Use cases"]);
    await expect(header.locator(".customers-mega-menu__reviews-link strong")).toHaveText("Verified Shopify reviews");
    await expect(header.locator(".customers-mega-menu__reviews-link > span:not(.customers-mega-menu__action)")).toContainText("Shopify App Store");
    expect(await header.locator(".customers-mega-menu__marker").evaluateAll((markers) => markers.every((marker) => {
      const rect = marker.getBoundingClientRect();
      return Math.abs(rect.width - rect.height) <= 0.01;
    }))).toBe(true);
    const customerReviewsLink = header.locator('.customers-mega-menu__reviews-link[href="https://apps.shopify.com/peak-pim/reviews"]');
    await expect(customerReviewsLink).toHaveAttribute("target", "_blank");
    await expect(customerReviewsLink).toHaveAttribute("rel", "noopener");
    const customerStoryLink = header.locator('.customers-mega-menu__story-link[href="/customers/maeli-paris/"]');
    await expect(customerStoryLink).toHaveCount(1);
    await expect(customerStoryLink.locator(".customers-mega-menu__story-image > img")).toHaveAttribute("alt", "Amélie Samson, founder of Maéli Paris");
    await expect(customerStoryLink.locator(".customers-mega-menu__story-logo img")).toHaveAttribute("alt", "Maéli Paris");
    await expect(customerStoryLink.locator(".customers-mega-menu__story-content > span:not(.customers-mega-menu__action)")).toHaveText("Save hours with weekly Drops and grow revenue in new markets.");
    const carreCocoStoryLink = header.locator('.customers-mega-menu__story-link[href="/customers/carre-coco/"]');
    await expect(carreCocoStoryLink).toHaveCount(1);
    await expect(carreCocoStoryLink.locator(".customers-mega-menu__story-image > img")).toHaveAttribute("alt", "Coline Leleu, founder of Carré Coco");
    await expect(carreCocoStoryLink.locator(".customers-mega-menu__story-logo img")).toHaveAttribute("alt", "Carré Coco");
    const customerCardHeights = await header.locator(".customers-mega-menu__reviews-link, .customers-mega-menu__story-link").evaluateAll((cards) => (
      cards.map((card) => card.getBoundingClientRect().height)
    ));
    expect(Math.max(...customerCardHeights) - Math.min(...customerCardHeights)).toBeLessThanOrEqual(1);

    await resourcesToggle.focus();
    await resourcesToggle.press("Enter");
    await expect(resourcesToggle).toHaveAttribute("aria-expanded", "true");
    await expect(customersToggle).toHaveAttribute("aria-expanded", "false");
    await expect(header.locator(".resources-mega-menu__dropdown")).toBeVisible();
    await expect(header.locator(".resources-mega-menu__link-heading strong")).toHaveText(["Live demo", "Help Center", "Product Updates", "API documentation"]);
    expect(await header.locator(".resources-mega-menu__link-heading").evaluateAll((headings) => headings.every((heading) => heading.firstElementChild?.classList.contains("resources-mega-menu__link-marker")))).toBe(true);
    expect(await header.locator(".resources-mega-menu__link-marker").evaluateAll((markers) => markers.every((marker) => {
      const rect = marker.getBoundingClientRect();
      return Math.abs(rect.width - rect.height) <= 0.01;
    }))).toBe(true);
    await expect(header.locator(".resources-mega-menu__link")).toHaveCount(4);
    expect(await header.locator(".resources-mega-menu__link").evaluateAll((links) => links.every((link) => link.getAttribute("target") === "_blank" && link.getAttribute("rel") === "noopener"))).toBe(true);
    await expect(header.locator('.resources-mega-menu__link[href="https://app.peak-pim.com/demo"]')).toHaveCount(1);
    await expect(header.locator('.resources-mega-menu__link[href="https://help.peak-pim.com/en/"]')).toHaveCount(1);
    await expect(header.locator('.resources-mega-menu__link[href="https://www.linkedin.com/company/peak-pim/posts/"]')).toHaveCount(1);
    await expect(header.locator('.resources-mega-menu__link[href="https://developers.peak-pim.com/"]')).toHaveCount(1);
    await expect(header.locator('.navbar10_menu-left > a[href="https://help.peak-pim.com/en/"]')).toHaveCount(0);
    await resourcesToggle.press("Escape");
    await expect(resourcesToggle).toHaveAttribute("aria-expanded", "false");

    for (const path of featurePaths) {
      if (path !== "/industry/fashion") {
        await expect(header.locator(`.feature-mega-menu__link[href="${path}"]`)).toHaveCount(1);
      }
      await expect(page.locator(`.site-footer a[href="${path}"]`)).toHaveCount(1);
    }

    await expect(header.locator('.feature-mega-menu__group[aria-labelledby="feature-group-manage-enrich"] .feature-mega-menu__link-title')).toHaveText([
      "Products & variants",
      "Collections",
      "Metafields",
      "Metaobjects",
      "Translations",
      "Markets & catalogs",
      "Custom fields",
    ]);
    await expect(header.locator('.feature-mega-menu__link[href="/industry/fashion"]')).toHaveCount(0);

    const footer = page.locator(".site-footer");
    await expect(footer.locator(".footer1_link-column")).toHaveCount(5);
    await expect(footer.locator(".site-footer__feature-category-title")).toHaveText(["Connect", "Operate", "Manage & Enrich"]);
    await expect(footer.locator('.site-footer__feature-category:nth-child(3) .footer1_link > span:first-child')).toHaveText([
      "Products & variants",
      "Collections",
      "Metafields",
      "Metaobjects",
      "Translations",
      "Markets & catalogs",
      "Custom fields",
    ]);
    await expect(footer.locator(".site-footer__solutions-column")).toContainText("Fashion");
    await expect(footer.locator(".site-footer__coming-soon > span:first-child")).toHaveText(["Amazon sync", "Automations", "Scores", "Backups"]);
    expect(await footer.locator(".site-footer__coming-soon").evaluateAll((elements) => elements.every((element) => !element.hasAttribute("href")))).toBe(true);
    const operateFooterColumns = await footer.locator(".site-footer__feature-category.is-dense .footer1_link-list").evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length);
    expect(operateFooterColumns).toBe(width >= 992 ? 2 : 1);
    await expect(footer.locator(".site-footer__feature-link > span:first-child")).toHaveText([
      "AI Connector (MCP)",
      "AI Assistant",
      "Drops",
      "History",
      "Global search",
      "Health Center",
      "Markets & catalogs",
    ]);
    await expect(footer.locator(".site-footer__feature-link .feature-status-badge")).toHaveText(["New", "New", "New", "New", "New", "New", "New"]);
    await expect(footer.locator(".site-footer__column-heading")).toHaveText(["Features", "Solutions", "Compare", "Peak", "Resources"]);
    await expect(footer.locator(".footer1_link-column").filter({ hasText: "Compare" }).locator(".footer1_link").nth(0)).toHaveText("PIM alternatives");
    await expect(footer.locator(".footer1_link-column").filter({ hasText: "Compare" }).locator(".footer1_link").nth(1)).toHaveText("Build vs buy a PIM");
    await expect(footer.locator('a[href="/build-vs-buy-pim/"]')).toHaveCount(1);
    const resourcesLiveDemoLink = footer.locator('.site-footer__resources-column a[href="https://app.peak-pim.com/demo"]');
    await expect(resourcesLiveDemoLink).toHaveText("Live demo");
    await expect(resourcesLiveDemoLink).toHaveAttribute("target", "_blank");
    await expect(resourcesLiveDemoLink).toHaveAttribute("rel", "noopener");
    const logoLiveDemoCta = footer.locator('.footer1_left-wrapper .site-footer__logo-cta a[href="https://app.peak-pim.com/demo"]');
    await expect(logoLiveDemoCta).toHaveText("Live demo");
    await expect(logoLiveDemoCta).toHaveClass(/button is-secondary w-button/);
    await expect(footer.locator(".site-footer__resources-column .footer1_link")).toHaveText(["Live demo", "Help Center", "Product Updates", "API documentation"]);
    await expect(footer.locator(".site-footer__peak-column")).not.toContainText("Live demo");
    await expect(footer.locator(".site-footer__peak-column")).not.toContainText("Help Center");
    await expect(footer.locator(".site-footer__peak-column")).not.toContainText("Product Updates");
    await expect(footer.locator(".site-footer__heading-marker")).toHaveCount(5);
    await expect(footer.locator(".footer1_bottom-wrapper .site-footer__bottom-social-links .footer1_social-link")).toHaveCount(6);
    await expect(footer.locator(".footer1_bottom-wrapper .site-footer__bottom-social-links .icon-embed-xsmall")).toHaveCount(6);
    await expect(footer.locator(".footer1_left-wrapper .site-footer__social-links")).toHaveCount(0);
    const footerBottomLayout = await footer.locator(".footer1_bottom-wrapper").evaluate((element) => {
      const wrapper = element.getBoundingClientRect();
      const credit = element.querySelector(".footer1_credit-text")?.getBoundingClientRect();
      const privacy = element.querySelector(".footer1_legal-list")?.getBoundingClientRect();
      const social = element.querySelector(".site-footer__bottom-social-links")?.getBoundingClientRect();
      return {
        wrapper: { left: wrapper.left, right: wrapper.right },
        credit: credit ? { left: credit.left, right: credit.right, top: credit.top } : null,
        privacy: privacy ? { left: privacy.left, right: privacy.right, top: privacy.top } : null,
        social: social ? { left: social.left, right: social.right, top: social.top } : null,
      };
    });
    expect(footerBottomLayout.credit).not.toBeNull();
    expect(footerBottomLayout.privacy).not.toBeNull();
    expect(footerBottomLayout.social).not.toBeNull();
    for (const item of [footerBottomLayout.credit!, footerBottomLayout.privacy!, footerBottomLayout.social!]) {
      expect(item.left).toBeGreaterThanOrEqual(footerBottomLayout.wrapper.left - 1);
      expect(item.right).toBeLessThanOrEqual(footerBottomLayout.wrapper.right + 1);
    }
    if (width >= 992) {
      expect(Math.abs(footerBottomLayout.credit!.top - footerBottomLayout.privacy!.top)).toBeLessThanOrEqual(1);
      expect(Math.abs(footerBottomLayout.credit!.top - footerBottomLayout.social!.top)).toBeLessThanOrEqual(8);
      expect(footerBottomLayout.privacy!.right).toBeLessThan(footerBottomLayout.social!.left);
    }
    const footerColumns = await footer.locator(".footer1_menu-wrapper").evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length);
    const featureColumns = await footer.locator(".site-footer__feature-categories").evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length);
    expect(footerColumns).toBe(width >= 992 ? 4 : width >= 768 ? 2 : 1);
    expect(featureColumns).toBe(width >= 992 ? 3 : width > 560 ? 2 : 1);

    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  }
});

test("import-export · responsive workflow and product contract", async ({ page }) => {
  for (const width of [1440, 992, 768, 767, 375]) {
    await prepare(page, "/shopify-product-import-export", width, 1000);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator(".peak-card-grid__card")).toHaveCount(3);
    await expect(page.locator(".peak-feature-grid__card")).toHaveCount(4);
    await expect(page.getByRole("img", { name: "Peak PIM import review showing a supplier spreadsheet mapped to catalog records with before and after changes" })).toHaveCount(1);
    await expect(page.locator(".peak-hero__visual img, .peak-card-grid__visual img")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  }

  await prepare(page, "/shopify-product-import-export", 1440, 1000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".peak-ie-row").nth(1)).toHaveCSS("animation-name", "none");
  const firstQuestion = page.locator(".peak-faq__question").first();
  await firstQuestion.focus();
  await firstQuestion.press("Enter");
  await expect(firstQuestion).toHaveAttribute("aria-expanded", "true");
});

test("drops · responsive scheduling and rollback contract", async ({ page }) => {
  for (const width of [1440, 992, 768, 767, 375]) {
    await prepare(page, "/shopify-product-drops", width, 1000);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator(".peak-card-grid__card")).toHaveCount(3);
    await expect(page.locator(".peak-feature-grid__card")).toHaveCount(4);
    await expect(page.getByRole("img", { name: "Peak PIM Drop review showing scheduled Shopify price and product changes with automatic rollback" })).toHaveCount(1);
    await expect(page.locator(".peak-hero__visual img, .peak-card-grid__visual img")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  }

  await prepare(page, "/shopify-product-drops", 1440, 1000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".peak-drop-restore i")).toHaveCSS("animation-name", "none");
  const firstQuestion = page.locator(".peak-faq__question").first();
  await firstQuestion.focus();
  await firstQuestion.press("Enter");
  await expect(firstQuestion).toHaveAttribute("aria-expanded", "true");
});

test("health-center · responsive analysis and repair contract", async ({ page }) => {
  for (const width of [1440, 992, 768, 767, 375]) {
    await prepare(page, "/shopify-catalog-health-center", width, 1000);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator(".peak-card-grid__card")).toHaveCount(3);
    await expect(page.locator(".peak-feature-grid__card")).toHaveCount(4);
    await expect(page.getByRole("img", { name: "Peak PIM Health Center dashboard showing catalog issues by synchronization, consistency, completeness, translations, and unused items" })).toHaveCount(1);
    await expect(page.locator(".peak-hero__visual img, .peak-card-grid__visual img")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  }

  await prepare(page, "/shopify-catalog-health-center", 1440, 1000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".peak-health-grid .is-improving .after")).toHaveCSS("animation-name", "none");
  const firstQuestion = page.locator(".peak-faq__question").first();
  await firstQuestion.focus();
  await firstQuestion.press("Enter");
  await expect(firstQuestion).toHaveAttribute("aria-expanded", "true");
});

for (const feature of [
  { name: "ai-connector", path: "/ai-catalog-connector", aria: "Peak PIM AI Connector (MCP) conversation showing a merchant asking about missing SEO descriptions and reviewing catalog results", motion: ".peak-ai-message.is-assistant" },
  { name: "ai-assistant", path: "/ai-assistant", aria: "Peak PIM AI Assistant beside a Shopify product, finding missing catalog fields, preparing a before-and-after draft, and asking for separate publishing approval", motion: ".peak-assistant-diff" },
  { name: "developer-api", path: "/api", aria: "Peak PIM developer API workspace showing a store-specific product update and publish response", motion: ".peak-api-divider" },
  { name: "metaobjects", path: "/shopify-metaobjects", aria: "Peak PIM metaobject workspace showing a Size Guide definition, typed entry fields, and publishing results across Shopify stores", motion: ".peak-mo-stores > div" },
  { name: "metafields", path: "/shopify-metafield-management", aria: "Peak PIM metafield definition workspace showing one Material definition linked across US, France, and Germany Shopify stores", motion: ".peak-mf-coverage > div:last-of-type" },
  { name: "custom-fields", path: "/shopify-custom-fields", aria: "Peak PIM custom fields workspace showing Shopify metafields beside private PIM-only workflow fields on a product record", motion: ".peak-cf-private" },
  { name: "roles-permissions", path: "/user-roles-permissions", aria: "Peak PIM users and permissions workspace showing a catalog editor with selected stores and separate view, edit, and publish access", motion: ".peak-rp-users > span.active" },
  { name: "collections", path: "/shopify-collections", aria: "Peak PIM collections workspace showing one Holiday Gifts collection with content, SEO, and product memberships across US, France, and Germany Shopify stores", motion: ".peak-col-grid .is-membership b:last-child" },
  { name: "markets-catalogs", path: "/shopify-markets-pricing", aria: "Peak PIM Markets and Catalogs workspace showing fixed variant prices across France, Switzerland, United Kingdom, and two Shopify stores", motion: ".peak-mkt-price.is-fixed.is-focus" },
  { name: "products-variants", path: "/shopify-product-management", aria: "Peak PIM product workspace showing one Summit Shell Jacket with intentional field and variant differences across US, France, and Germany Shopify stores", motion: ".peak-pv-grid .is-variant-row b:last-child" },
  { name: "history", path: "/history", aria: "Peak PIM History workspace showing saved catalog edits, published store changes, authors, sources, and field-level before and after values", motion: ".peak-history-published" },
  { name: "global-search", path: "/search", aria: "Peak PIM Global Search command palette finding a Shopify variant by SKU across products, media, fields, pages, and connected stores", motion: ".peak-search-group article.is-selected" },
]) {
  test(`${feature.name} · responsive product and interaction contract`, async ({ page }) => {
    for (const width of [1440, 1100, 992, 768, 767, 540, 375]) {
      await prepare(page, feature.path, width, 1000);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator(".peak-card-grid__card")).toHaveCount(3);
      await expect(page.locator(".peak-feature-grid__card")).toHaveCount(4);
      await expect(page.getByRole("img", { name: feature.aria })).toHaveCount(1);
      await expect(page.locator(".peak-hero__visual img, .peak-card-grid__visual img")).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    }
    await prepare(page, feature.path, 1440, 1000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator(feature.motion)).toHaveCSS("animation-name", "none");
    const firstQuestion = page.locator(".peak-faq__question").first();
    await firstQuestion.focus();
    await firstQuestion.press("Enter");
    await expect(firstQuestion).toHaveAttribute("aria-expanded", "true");
  });
}

test("translations · canonical sections", async ({ page }) => {
  await prepare(page, "/shopify-pim-translations", 1440, 1000);
  for (const selector of [".section_header26", ".section_layout237", ".section_layout395", ".section_layout353", ".section_testimonial4", ".section_cta51", ".section_faq1"]) {
    await expect(page.locator(selector)).toHaveCount(1);
  }
  await expect(page.locator("[class*='ds-']")).toHaveCount(0);
  await expect(page.getByRole("img", { name: "Peak PIM translation workflow showing catalog coverage, AI-generated drafts, side-by-side review, and multi-store publishing" })).toHaveCount(1);
  await expect(page.locator(".peak-hero__visual img, .peak-card-grid__visual img")).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".peak-tr-grid .is-ai").first()).toHaveCSS("animation-name", "none");
});

test("translations · semantic component API preserves legacy styling hooks", async ({ page }) => {
  await prepare(page, "/shopify-pim-translations", 1440, 1000);
  for (const selector of [
    ".peak-hero.section_header26",
    ".peak-logo-cloud.section_logo2",
    ".peak-problem-grid.section_layout237",
    ".peak-card-grid.section_layout395",
    ".peak-testimonial.section_testimonial4",
    ".peak-feature-grid.section_layout353",
    ".peak-cta-banner.section_cta51",
    ".peak-faq.section_faq1",
  ]) {
    await expect(page.locator(selector)).toHaveCount(1);
  }
});

test("multi-store · retired Scale plan is absent at every breakpoint", async ({ page }) => {
  for (const width of [1440, 768, 375]) {
    await prepare(page, "/shopify-multi-store-pim", width, 1000);
    const pricing = page.locator(".section_pricing29");
    const plans = pricing.locator(".pricing29_plan");
    await expect(plans).toHaveCount(3);
    await expect(plans.locator(".heading-style-h6")).toHaveText(["Core", "Elite", "Enterprise"]);
    await expect(plans.nth(0)).toContainText("$99/mo");
    await expect(plans.nth(0)).toContainText("1,500 SKUs");
    await expect(plans.nth(0)).toContainText("Up to 2 Shopify stores");
    await expect(plans.nth(0)).toContainText("100GB files");
    await expect(plans.nth(1)).toContainText("$249/mo");
    await expect(plans.nth(1)).toContainText("5,000 SKUs");
    await expect(plans.nth(1)).toContainText("Up to 3 Shopify stores");
    await expect(plans.nth(1)).toContainText("500GB files");
    await expect(plans.nth(2)).toContainText("Custom Shopify stores");
    await expect(plans.nth(2)).toContainText("Custom SKU limits");
    await expect(plans.nth(2)).toContainText("Custom file storage");
    await expect(plans.nth(2)).toContainText("Dedicated support");
    await expect(plans.nth(2)).not.toContainText("Metaobjects");
    await expect(plans.nth(2)).not.toContainText("Translations");
    await expect(pricing).not.toContainText("$499");
    expect((await plans.allTextContents()).join(" ")).not.toMatch(/\bScale\b/);
    await expect(page.locator(".section_faq1")).toContainText("Core supports 2 stores and Elite supports 3");
    await expect(page.locator(".section_faq1")).toContainText("Core includes 2 stores and Elite includes 3");
    await expect(page.locator(".section_faq1")).not.toContainText("Scale supports 8");
    await expect(page.locator(".section_faq1")).not.toContainText("unlimited on Enterprise");
    expect(await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) =>
      scripts.some((script) => /"name"\s*:\s*"Scale"|Scale supports 8/.test(script.textContent ?? "")),
    )).toBe(false);
    expect(await plans.evaluateAll((items) => Math.max(...items.map((item) => {
      const rect = item.getBoundingClientRect();
      return Math.max(0, -rect.left, rect.right - window.innerWidth);
    })))).toBeLessThanOrEqual(1);
  }
});

test("build vs buy · responsive comparison and SEO contract", async ({ page }) => {
  const sectionIds = ["verdict", "comparison", "pricing-comparison", "decision", "implementation", "faq", "start"];

  for (const width of [2048, 1440, 992, 768, 767, 375]) {
    await prepare(page, "/build-vs-buy-pim", width, 1000);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main h2")).toHaveCount(7);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    await expect(page.locator(".peak-comparison-table__card")).toHaveCount(2);
    await expect(page.locator(".pricing50_row")).toHaveCount(7);
    const comparisonColumns = await page.locator(".peak-comparison-table__grid").evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length);
    expect(comparisonColumns).toBe(width < 768 ? 1 : 2);
    if (width < 768) await expect(page.locator(".pricing50_feature").first()).toHaveCSS("grid-column", "1 / -1");
    const heroImageBox = await page.locator(".build-buy-evidence").boundingBox();
    expect(heroImageBox).not.toBeNull();
    expect(Math.abs(heroImageBox!.width / heroImageBox!.height - 1190 / 812)).toBeLessThanOrEqual(0.01);
  }

  await prepare(page, "/build-vs-buy-pim", 1440, 1000);
  for (const id of sectionIds) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  await expect(page.locator(".peak-faq__answer").filter({ visible: true })).toHaveCount(0);
  const heroVisual = page.getByRole("img", { name: "Post describing a team returning to Linear because maintaining its internally built tool consumed work bandwidth" });
  const decisionVisual = page.getByRole("img", { name: "Decision workspace comparing when to build a PIM in-house and when to choose Peak PIM" });
  await expect(heroVisual).toHaveCount(1);
  await expect(decisionVisual).toHaveCount(1);
  await expect(page.locator('.peak-comparison-hero__visual img[src="/assets/marketing/build-vs-buy-maintenance-example.webp"]')).toHaveCount(1);
  await expect(page.locator(".build-buy-evidence__frame, .build-buy-evidence__topbar, .build-buy-evidence__image-wrap, .build-buy-evidence + figcaption")).toHaveCount(0);
  await expect(page.locator(".peak-comparison-hero__visual.is-plain")).toHaveCSS("border-radius", "0px");
  await expect(heroVisual).toHaveCSS("border-radius", "14px");
  await expect(heroVisual).not.toHaveCSS("box-shadow", "none");
  await expect(page.locator("#decision .peak-decision-guide__image-wrapper img")).toHaveCount(0);
  const firstHeroCta = page.locator(".peak-comparison-hero a").first();
  await page.locator("body").click({ position: { x: 1, y: 1 } });
  for (let index = 0; index < 30 && !(await firstHeroCta.evaluate((element) => element === document.activeElement)); index += 1) {
    await page.keyboard.press("Tab");
  }
  await expect(firstHeroCta).toBeFocused();
  await expect(firstHeroCta).toHaveCSS("outline-style", "solid");
  const firstFaqQuestion = page.locator(".peak-faq__question").first();
  await firstFaqQuestion.focus();
  await page.keyboard.press("Enter");
  await expect(firstFaqQuestion).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(".peak-faq__answer").first()).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".build-buy-evidence")).toBeVisible();
  expect(await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) => scripts.map((script) => JSON.parse(script.textContent ?? "{}")["@type"]))).toEqual(expect.arrayContaining(["Article", "FAQPage"]));
});

test("build vs buy · comparison typography and controls match the approved reference", async ({ page }) => {
  const selectors = [".section_header1 .heading-style-h1", ".section_header1 .text-size-medium", ".section_header1 .button", ".section_layout140 .heading-style-h5", ".section_comparison14 .heading-style-h2", ".section_pricing50 .heading-style-h1", ".section_layout4 .heading-style-h2"];
  const readStyles = (selectorsToRead: string[]) => selectorsToRead.map((selector) => {
    const element = document.querySelector(selector);
    if (!element) return null;
    const style = getComputedStyle(element);
    return { fontFamily: style.fontFamily, fontSize: style.fontSize, lineHeight: style.lineHeight, fontWeight: style.fontWeight, borderRadius: style.borderRadius, padding: style.padding };
  });

  await prepare(page, "/build-vs-buy-pim", 1440, 1000);
  const buildVsBuyStyles = await page.evaluate(readStyles, selectors);
  await prepare(page, "/vs/akeneo", 1440, 1000);
  expect(await page.evaluate(readStyles, selectors)).toEqual(buildVsBuyStyles);
});

test("translations · complete workflow cards match the finished homepage", async ({ page }) => {
  const selectors = [".section_layout395 .heading-style-h2", ".section_layout395 .heading-style-h4", ".layout395_grid-list", ".layout395_row", ".layout395_card", ".layout395_card-content"];
  const readStyles = (selectorsToRead: string[]) => selectorsToRead.map((selector) => {
    const element = document.querySelector(selector);
    if (!element) return null;
    const style = getComputedStyle(element);
    return { fontSize: style.fontSize, lineHeight: style.lineHeight, fontWeight: style.fontWeight, display: style.display, gap: style.gap, padding: style.padding, border: style.border, borderRadius: style.borderRadius, overflow: style.overflow };
  });

  await prepare(page, "/shopify-pim-translations", 1440, 1000);
  const translationStyles = await page.evaluate(readStyles, selectors);
  await prepare(page, "/", 1440, 1000);
  expect(await page.evaluate(readStyles, selectors)).toEqual(translationStyles);
});

test("translations · each workflow item is one complete equal-height card", async ({ page }) => {
  await prepare(page, "/shopify-pim-translations", 1440, 1000);
  await expect(page.locator(".section_layout395 .layout395_card")).toHaveCount(3);
  expect(await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll(".section_layout395 .layout395_card"));
    const heights = cards.map((card) => card.getBoundingClientRect().height);
    return {
      complete: cards.every((card) => Boolean(card.querySelector(".layout395_card-image-wrapper") && card.querySelector(".layout395_card-content") && card.querySelector(".tag.is-text") && card.querySelector(".heading-style-h4") && card.querySelector("p"))),
      heightDelta: Math.max(...heights) - Math.min(...heights),
    };
  })).toEqual({ complete: true, heightDelta: 0 });
});

test("translations · complete workflow cards stack at tablet and mobile widths", async ({ page }) => {
  for (const width of [768, 375]) {
    await prepare(page, "/shopify-pim-translations", width, 1000);
    const layout = await page.evaluate(() => Array.from(document.querySelectorAll(".section_layout395 .layout395_card")).map((card) => {
      const cardRect = card.getBoundingClientRect();
      const visualRect = card.querySelector(".peak-tr-card")?.getBoundingClientRect();
      return { left: cardRect.left, top: cardRect.top, cardWidth: cardRect.width, visualWidth: visualRect?.width ?? 0 };
    }));
    expect(new Set(layout.map((card) => Math.round(card.left))).size).toBe(1);
    expect(layout[1].top).toBeGreaterThan(layout[0].top);
    expect(layout[2].top).toBeGreaterThan(layout[1].top);
    expect(layout.every((card) => Math.abs(card.cardWidth - card.visualWidth - 2) < 1)).toBe(true);
  }
});

test("translations · capability stack matches the original four-card reference", async ({ page }) => {
  const readStack = () => Array.from(document.querySelectorAll(".section_layout353 .layout353_content-item")).map((item) => {
    const style = getComputedStyle(item);
    return {
      positionClass: Array.from(item.classList).find((name) => name.startsWith("content-item-")),
      position: style.position,
      top: style.top,
      padding: style.padding,
      border: style.border,
      borderRadius: style.borderRadius,
      marginBottom: style.marginBottom,
      overflow: style.overflow,
    };
  });

  await prepare(page, "/shopify-pim-translations", 1440, 1000);
  const translationStack = await page.evaluate(readStack);
  expect(translationStack.map(({ positionClass, top }) => ({ positionClass, top }))).toEqual([
    { positionClass: "content-item-1", top: "300px" },
    { positionClass: "content-item-2", top: "320px" },
    { positionClass: "content-item-3", top: "340px" },
    { positionClass: "content-item-4", top: "360px" },
  ]);
  await prepare(page, "/1-click-setup", 1440, 1000);
  expect(await page.evaluate(readStack)).toEqual(translationStack);
});

test("translations · completed four-card stack resolves to its last card", async ({ page }) => {
  await prepare(page, "/shopify-pim-translations", 1440, 1000);
  await page.evaluate(() => {
    const stack = document.querySelector(".section_layout353 .layout353_content-right");
    if (!stack) return;
    const bottom = stack.getBoundingClientRect().bottom + window.scrollY;
    window.scrollTo(0, bottom - window.innerHeight * 0.5);
  });
  expect(await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll(".section_layout353 .layout353_content-item"));
    const rects = cards.map((card) => card.getBoundingClientRect());
    const last = cards.at(-1)!;
    const lastRect = rects.at(-1)!;
    const topCard = document.elementFromPoint(lastRect.left + 8, lastRect.top + 8)?.closest(".layout353_content-item");
    return {
      bottomDelta: Math.max(...rects.map((rect) => rect.bottom)) - Math.min(...rects.map((rect) => rect.bottom)),
      earlierCardAboveLast: rects.slice(0, -1).some((rect) => rect.top < lastRect.top - 1),
      visibleHeading: topCard?.querySelector("h3")?.textContent,
      lastHeading: last.querySelector("h3")?.textContent,
    };
  })).toEqual({
    bottomDelta: 0,
    earlierCardAboveLast: false,
    visibleHeading: "Keep every path draft-first",
    lastHeading: "Keep every path draft-first",
  });
  await expect(page).toHaveScreenshot("translations-feature-stack-final.png", { animations: "disabled", fullPage: false, maxDiffPixelRatio: 0.015 });
});

test("translations · completed capability stack is covered at every responsive width", async ({ page }) => {
  const widths = [360, 375, 479, 480, 640, 767, 768, 900, 991, 992, 1024, 1100, 1152, 1200, 1280, 1366, 1440, 1536, 1600];
  const failures: Array<{ width: number; heights: number[]; bottomDelta: number; earlierCardAboveLast: boolean; visibleHeading?: string }> = [];

  for (const width of widths) {
    await prepare(page, "/shopify-pim-translations", width, 900);
    await page.evaluate(() => {
      const stack = document.querySelector(".section_layout353 .layout353_content-right");
      if (!stack) return;
      const bottom = stack.getBoundingClientRect().bottom + window.scrollY;
      window.scrollTo(0, bottom - window.innerHeight * 0.5);
    });
    const result = await page.locator(".section_layout353 .layout353_content-item").evaluateAll((cards) => {
      const rects = cards.map((card) => card.getBoundingClientRect());
      const lastRect = rects.at(-1)!;
      const headerBottom = document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 0;
      const sampleY = Math.min(lastRect.bottom - 8, Math.max(lastRect.top + 8, headerBottom + 8));
      const topCard = document.elementFromPoint(lastRect.left + 8, sampleY)?.closest(".layout353_content-item");
      return {
        heights: rects.map((rect) => rect.height),
        bottomDelta: Math.max(...rects.map((rect) => rect.bottom)) - Math.min(...rects.map((rect) => rect.bottom)),
        earlierCardAboveLast: rects.slice(0, -1).some((rect) => rect.top < lastRect.top - 1),
        visibleHeading: topCard?.querySelector("h3")?.textContent?.trim(),
      };
    });
    const heightDelta = Math.max(...result.heights) - Math.min(...result.heights);
    if (heightDelta > 1 || result.bottomDelta > 1 || result.earlierCardAboveLast || result.visibleHeading !== "Keep every path draft-first") {
      failures.push({ width, ...result });
    }
  }

  expect(failures).toEqual([]);
});

test("translations · logo strip matches the homepage and FAQ matches the feature-page reference", async ({ page }) => {
  const selectors = [".section_logo2 h2", ".logo2_wrapper img", ".section_faq1 h2", ".faq1_question .text-size-medium", ".faq1_answer p"];
  const readStyles = (selectorsToRead: string[]) => selectorsToRead.map((selector) => {
    const element = document.querySelector(selector);
    if (!element) return null;
    const style = getComputedStyle(element);
    return { fontSize: style.fontSize, lineHeight: style.lineHeight, fontWeight: style.fontWeight, color: style.color, textDecoration: style.textDecoration, maxHeight: style.maxHeight };
  });

  await prepare(page, "/shopify-pim-translations", 1440, 1000);
  const translationStyles = await page.evaluate(readStyles, selectors);
  await expect(page.locator(".section_logo2.color-scheme-2")).toHaveCount(1);
  await expect(page.locator(".section_logo2 .logo2_wrapper")).toHaveCount(10);
  await expect(page.locator(".section_logo2 .logo2_link")).toHaveCount(10);
  expect(await page.locator(".section_logo2 .logo2_link").evaluateAll((links) => links.every((link) => (
    link.getAttribute("target") === "_blank" && link.getAttribute("rel") === "nofollow noopener"
  )))).toBe(true);
  const maeliLogoLink = page.locator('.section_logo2 .logo2_link[href="https://maeliparis.com/"]');
  const restingLogoStyles = await maeliLogoLink.evaluate((element) => ({
    linkTransform: getComputedStyle(element).transform,
    imageTransform: getComputedStyle(element.querySelector("img")!).transform,
  }));
  await maeliLogoLink.hover();
  await expect.poll(() => maeliLogoLink.evaluate((element) => ({
    linkTransform: getComputedStyle(element).transform,
    imageTransform: getComputedStyle(element.querySelector("img")!).transform,
  }))).not.toEqual(restingLogoStyles);
  const waterdropLogoLink = page.locator('.section_logo2 .logo2_link[href="https://www.waterdrop.com/"]');
  await waterdropLogoLink.hover();
  await expect.poll(() => waterdropLogoLink.evaluate((element) => ({
    background: getComputedStyle(element).backgroundColor,
    imageOpacity: getComputedStyle(element.querySelector("img")!).opacity,
  }))).toEqual({ background: "rgba(0, 0, 0, 0)", imageOpacity: "1" });
  await expect(page.locator(".section_logo2")).toHaveScreenshot("translations-logo-strip-waterdrop-hover.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.015,
  });
  await expect(page.locator(".section_logo2 h2")).toHaveText("Trusted by 50+ top merchants worldwide");
  await expect(page.locator(".section_faq1 h2")).toHaveText("Frequently asked questions");

  await prepare(page, "/shopify-media-management", 1440, 1000);
  expect(await page.evaluate(readStyles, selectors)).toEqual(translationStyles);

  await prepare(page, "/industry/fashion", 1440, 1000);
  expect(await page.evaluate(readStyles, selectors.slice(0, 2))).toEqual(translationStyles.slice(0, 2));
  await expect(page.locator(".section_logo2 .logo2_wrapper")).toHaveCount(10);
  await expect(page.locator(".section_logo2 h2")).toHaveText("Trusted by 50+ top merchants worldwide");
});

test("translations · uses the original global font smoothing", async ({ page }) => {
  await prepare(page, "/shopify-pim-translations", 1440, 1000);
  expect(await page.evaluate(() => Array.from(document.styleSheets).some((sheet) => {
    try {
      return Array.from(sheet.cssRules).some((rule) => rule.cssText.includes("-webkit-font-smoothing: antialiased"));
    } catch {
      return false;
    }
  }))).toBe(true);
});

for (const specimen of [
  { name: "workflow-cards", selector: ".section_layout395" },
  { name: "logo-strip-canonical", selector: ".section_logo2" },
  { name: "faq", selector: ".section_faq1" },
] as const) {
  test(`translations · ${specimen.name} visual`, async ({ page }) => {
    await prepare(page, "/shopify-pim-translations", 1440, 1000);
    const section = page.locator(specimen.selector);
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();
    if (specimen.name === "logo-strip-canonical") {
      await page.locator(`${specimen.selector} img`).evaluateAll(async (images) => {
        await Promise.all(images.map((image) => (image as HTMLImageElement).complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => image.addEventListener("load", () => resolve(), { once: true }))));
      });
    }
    await expect(section).toHaveScreenshot(`translations-${specimen.name}.png`, { animations: "disabled", maxDiffPixelRatio: 0.015 });
  });
}
