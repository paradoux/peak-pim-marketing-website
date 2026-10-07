import { expect, test } from "@playwright/test";

const brands = ["Shopify", "PrestaShop", "Magento", "WooCommerce", "Amazon", "Faire", "Ankorstore", "Channable", "Lengow", "Odoo", "Fulfil.io", "Bigblue", "ShipBob", "Business Central", "Make", "n8n"];

test("homepage integrations · complete logos, simplified copy, placement and responsive layout", async ({ page }) => {
  await page.route("**/*", route => new URL(route.request().url()).hostname === "localhost" ? route.continue() : route.abort());
  for (const width of [1440, 1024, 768, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#integrations", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => document.fonts.ready);
    const section = page.locator("#integrations");
    await section.scrollIntoViewIfNeeded();
    await expect(section.locator("h2")).toHaveText("Connect Peak to your whole stack");
    await expect(section.locator("img")).toHaveCount(16);
    await expect(section.getByRole("link", { name: "Learn more" })).toHaveAttribute("href", "/custom-integrations");
    const geometry = await section.evaluate(el => {
      const grid = el.querySelector(".peak-integration-logos")!.getBoundingClientRect();
      const heading = el.querySelector("h2")!.getBoundingClientRect();
      return { gridX: grid.x, gridY: grid.y, headingRight: heading.right, headingBottom: heading.bottom, height: el.getBoundingClientRect().height };
    });
    if (width >= 768) {
      expect(geometry.gridX).toBeGreaterThan(geometry.headingRight);
      expect(geometry.height).toBeLessThan(width >= 992 ? 650 : 720);
    } else {
      expect(geometry.gridY).toBeGreaterThan(geometry.headingBottom);
    }
    expect(await section.locator("img").evaluateAll(imgs => imgs.every(img => img.getBoundingClientRect().width <= 97 && img.getBoundingClientRect().height <= 33))).toBe(true);
    expect(await section.locator("img").evaluateAll(imgs => imgs.map(img => img.alt))).toEqual(brands);
    await expect.poll(() => section.locator("img").evaluateAll(imgs => imgs.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
    const custom = section.locator(".peak-integration-logos__custom");
    await expect(custom.locator("span").first()).toHaveText("Custom integration");
    await expect(custom.getByRole("link", { name: "Talk to us" })).toHaveAttribute("data-open-crisp", "");
    expect(await custom.evaluate(el => getComputedStyle(el).gridColumn)).toBe("1 / -1");
    await expect(section.locator(".feature-status-badge")).toHaveCount(0);
    await expect(section).not.toContainText("Native Shopify sync. Custom connections for your other tools.");
    expect(await section.evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    expect(await section.evaluate(el => Boolean(el.compareDocumentPosition(document.querySelector('.section_layout121')!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  }
});

test("homepage integrations · translated copy and unchanged brand names", async ({ page }) => {
  await page.route("**/*", route => new URL(route.request().url()).hostname === "localhost" ? route.continue() : route.abort());
  await page.setViewportSize({ width: 375, height: 1000 });
  for (const locale of ["fr", "de", "es", "it", "nl", "pt-br", "pl", "ja"]) {
    await page.goto(`/${locale}/#integrations`, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => document.fonts.ready);
    const section = page.locator("#integrations");
    await expect(section).toBeVisible();
    await expect(section.locator("h2")).not.toHaveText("Connect Peak to your whole stack");
    await expect(section).not.toContainText("From storefronts to fulfillment, connect the tools your team already uses.");
    expect(await section.locator("img").evaluateAll(imgs => imgs.map(img => img.alt))).toEqual(brands);
    expect(await section.locator(".container-large").evaluate(el => el.scrollWidth - el.clientWidth), locale).toBeLessThanOrEqual(1);
  }
});
