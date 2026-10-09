import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/*", route => new URL(route.request().url()).hostname === "localhost" ? route.continue() : route.abort());
});

test("primary CTA hover keeps white text and stable geometry across shared layouts", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const path of ["/", "/pricing/", "/shopify-pim-translations/", "/customers/maeli-paris/", "/blog/"]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    const cta = page.locator(".site-header .navbar10_menu-right .button");
    await page.mouse.move(0, 0);
    const before = await cta.boundingBox();
    await cta.hover();
    await expect(cta).toHaveCSS("background-color", "rgb(40, 69, 214)");
    await expect(cta).toHaveCSS("color", "rgb(255, 255, 255)");
    const after = await cta.boundingBox();
    expect(after!.width).toBe(before!.width);
    expect(after!.height).toBe(before!.height);
  }
});

test("primary keyboard focus is consistent at every breakpoint without changing secondary buttons", async ({ page }) => {
  for (const width of [1440, 768, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const primary = page.locator("#hero .button:not(.is-secondary)");
    await primary.focus();
    await expect(primary).toHaveCSS("background-color", "rgb(40, 69, 214)");
    await expect(primary).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(primary).toHaveCSS("transition-duration", "0s");
    const secondary = page.locator(".site-footer__logo-cta .button.is-secondary");
    await secondary.hover();
    await expect(secondary).not.toHaveCSS("background-color", "rgb(40, 69, 214)");
    await expect(secondary).toHaveCSS("color", "rgb(26, 26, 26)");
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  }
});
