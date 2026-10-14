import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/*", route => new URL(route.request().url()).hostname === "localhost" ? route.continue() : route.abort());
  await page.addInitScript(() => {
    localStorage.setItem("peak-preferred-locale", location.pathname.startsWith("/fr/") ? "fr" : "en");
    localStorage.setItem("peak-demo-seen", String(Date.now()));
  });
});

for (const width of [1440, 768, 375]) {
  test(`Shopify animations fit their cards with static reduced-motion frames at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1100 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/", { waitUntil: "networkidle" });
    await page.addStyleTag({ content: "html { scroll-behavior: auto !important; } .site-header { visibility: hidden !important; }" });
    const section = page.locator("#shopify-native");
    await expect(section.locator("h2")).toHaveText("Built for Shopify merchants");
    await expect(section.locator("h3")).toHaveText(["One-click connection", "Two-way sync", "All your Shopify data"]);
    await expect(section.locator(".ppim-sn[data-ready='1']")).toHaveCount(3);
    await expect(section.locator(".ppim-sn-cbtn-t")).toHaveText("Connected");
    await expect(section.locator(".ppim-sn-ccount b")).toHaveText("2,847");
    await expect(section.locator(".ppim-sn-s-pim [data-k='price'] .ppim-sn-v")).toHaveText("$179.00");
    await expect(section.locator(".ppim-sn-s-shop [data-k='title'] .ppim-sn-v")).toHaveText("PeakPro Freeride X Goggles");
    await expect(section.locator(".ppim-sn-cell.is-done")).toHaveCount(8);
    for (const visual of await section.locator(".ppim-sn").all()) {
      const box = (await visual.boundingBox())!;
      expect(box.width).toBeCloseTo(box.height, 0);
      const canvas = (await visual.locator(".ppim-sn-canvas").boundingBox())!;
      expect(Math.abs(canvas.width - box.width)).toBeLessThan(1);
      await expect(visual).toHaveAttribute("role", "img");
      await expect(visual).toHaveAttribute("aria-label", /.+/);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await section.scrollIntoViewIfNeeded();
    await section.screenshot({ path: testInfo.outputPath(`shopify-animations-${width}.png`) });
    expect(errors).toEqual([]);
  });
}

test("supplied Shopify animations play and loop without script errors", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/", { waitUntil: "networkidle" });
  const section = page.locator("#shopify-native");
  await section.scrollIntoViewIfNeeded();
  await expect(section.locator(".ppim-sn-cbtn-t")).toHaveText("Connected", { timeout: 20000 });
  await expect(section.locator(".ppim-sn-s-shop [data-k='price'] .ppim-sn-v")).toHaveText("$179.00", { timeout: 20000 });
  await expect(section.locator(".ppim-sn-s-pim [data-k='title'] .ppim-sn-v")).toHaveText("PeakPro Freeride X Goggles", { timeout: 20000 });
  await expect(section.locator(".ppim-sn-node")).toHaveClass(/is-done/, { timeout: 20000 });
  await expect(section.locator(".ppim-sn-cbtn-t")).toHaveText("Connect store", { timeout: 20000 });
  expect(errors).toEqual([]);
});

test("Shopify animations appear in the design system and retain localized surrounding copy", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const path of ["/design-system/", "/fr/"]) {
    await page.goto(path, { waitUntil: "networkidle" });
    const section = page.locator("#shopify-native");
    await expect(section.locator(".ppim-sn[data-ready='1']")).toHaveCount(3);
    if (path === "/fr/") await expect(section.locator("h2")).toHaveText("Conçu pour les marchands Shopify");
  }
});
