import { expect, test, type Page } from "@playwright/test";

const pages = [
  { name: "catalogue", path: "/design-system" },
  { name: "bulk-edit", path: "/bulk-edit" },
  { name: "translations", path: "/shopify-pim-translations" },
] as const;

const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 375, height: 812 },
] as const;

async function prepare(page: Page, path: string, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await page.goto(path, { waitUntil: "networkidle" });
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

test("translations · canonical sections", async ({ page }) => {
  await prepare(page, "/shopify-pim-translations", 1440, 1000);
  for (const selector of [".section_header26", ".section_layout237", ".section_layout395", ".section_layout353", ".section_testimonial4", ".section_cta51", ".section_faq1"]) {
    await expect(page.locator(selector)).toHaveCount(1);
  }
  await expect(page.locator("[class*='ds-']")).toHaveCount(0);
});

test("translations · semantic component API preserves legacy styling hooks", async ({ page }) => {
  await prepare(page, "/shopify-pim-translations", 1440, 1000);
  for (const selector of [
    ".peak-hero.section_header26",
    ".peak-logo-cloud.section_logo3",
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
      const visualRect = card.querySelector(".peak-translation-step")?.getBoundingClientRect();
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
    visibleHeading: "Bulk translate and publish to regional stores",
    lastHeading: "Bulk translate and publish to regional stores",
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
      const topCard = document.elementFromPoint(lastRect.left + 8, lastRect.top + 8)?.closest(".layout353_content-item");
      return {
        heights: rects.map((rect) => rect.height),
        bottomDelta: Math.max(...rects.map((rect) => rect.bottom)) - Math.min(...rects.map((rect) => rect.bottom)),
        earlierCardAboveLast: rects.slice(0, -1).some((rect) => rect.top < lastRect.top - 1),
        visibleHeading: topCard?.querySelector("h3")?.textContent?.trim(),
      };
    });
    const heightDelta = Math.max(...result.heights) - Math.min(...result.heights);
    if (heightDelta > 1 || result.bottomDelta > 1 || result.earlierCardAboveLast || result.visibleHeading !== "Bulk translate and publish to regional stores") {
      failures.push({ width, ...result });
    }
  }

  expect(failures).toEqual([]);
});

test("translations · logo strip and FAQ match the feature-page reference", async ({ page }) => {
  const selectors = [".section_logo3 h2", ".logo3_logo", ".section_faq1 h2", ".faq1_question .text-size-medium", ".faq1_answer p"];
  const readStyles = (selectorsToRead: string[]) => selectorsToRead.map((selector) => {
    const element = document.querySelector(selector);
    if (!element) return null;
    const style = getComputedStyle(element);
    return { fontSize: style.fontSize, lineHeight: style.lineHeight, fontWeight: style.fontWeight, color: style.color, textDecoration: style.textDecoration, maxHeight: style.maxHeight };
  });

  await prepare(page, "/shopify-pim-translations", 1440, 1000);
  const translationStyles = await page.evaluate(readStyles, selectors);
  await expect(page.locator(".section_logo3.color-scheme-1")).toHaveCount(1);
  await expect(page.locator(".section_faq1 h2")).toHaveText("FAQ");

  await prepare(page, "/shopify-media-management", 1440, 1000);
  expect(await page.evaluate(readStyles, selectors)).toEqual(translationStyles);
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
  { name: "logo-strip-canonical", selector: ".section_logo3" },
  { name: "faq", selector: ".section_faq1" },
] as const) {
  test(`translations · ${specimen.name} visual`, async ({ page }) => {
    await prepare(page, "/shopify-pim-translations", 1440, 1000);
    const section = page.locator(specimen.selector);
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();
    await expect(section).toHaveScreenshot(`translations-${specimen.name}.png`, { animations: "disabled", maxDiffPixelRatio: 0.015 });
  });
}
