import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/*", route => new URL(route.request().url()).hostname === "localhost" ? route.continue() : route.abort());
  await page.addInitScript(() => localStorage.setItem("peak-preferred-locale", "en"));
});

for (const width of [1440, 1280, 1024, 1023, 768, 390, 375, 320]) {
  test(`homepage split hero fits ${width}px with a static reduced-motion scene`, async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/", { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const hero = page.locator("#hero");
    const animation = hero.locator("#ppim-hh");
    await expect(page.locator("h1")).toHaveText("Shopify Catalog management, for the AI era.");
    await expect(animation.locator('[data-scene="3"]')).toHaveClass(/is-in/);
    await expect(animation.locator(".ppim-hh-store.is-synced")).toHaveCount(3);
    const copy = (await hero.locator(".peak-hero__content").boundingBox())!;
    const art = (await animation.boundingBox())!;
    if (width >= 1024) {
      expect(art.x).toBeGreaterThan(copy.x + copy.width);
      expect(Math.abs(art.y + art.height / 2 - copy.y - copy.height / 2)).toBeLessThan(2);
    } else {
      expect(art.y).toBeGreaterThan(copy.y + copy.height);
    }
    expect(art.width).toBeLessThanOrEqual(620);
    expect(art.height / art.width).toBeCloseTo(art.width < 480 ? 500 / 380 : 1, 2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    expect(await animation.locator(".ppim-hh-simgfill").first().evaluate(el => getComputedStyle(el).backgroundImage)).toContain("/assets/product-ui/peak-pim-freeride-x-red.jpg");
    expect((await page.request.get("/assets/product-ui/peak-pim-freeride-x-red.jpg")).status()).toBe(200);
    const badge = (await hero.locator(".ppim-home-pill-wrap").boundingBox())!;
    expect(badge.x + badge.width / 2).toBeCloseTo(width / 2, 0);
    expect(badge.y + badge.height).toBeLessThan(copy.y);
    expect(badge.y + badge.height).toBeLessThan(art.y);
    const heroBox = (await hero.boundingBox())!;
    expect(badge.y - heroBox.y).toBeCloseTo(44, 0);
    const ctaBox = (await hero.getByRole("link", { name: "Book a demo", exact: true }).boundingBox())!;
    const ratingBox = (await hero.locator(".peak-home-rating").boundingBox())!;
    expect(ratingBox.x).toBeGreaterThan(ctaBox.x + ctaBox.width);
    expect(ratingBox.y + ratingBox.height / 2).toBeCloseTo(ctaBox.y + ctaBox.height / 2, 0);
    await expect(hero.getByRole("link", { name: "Book a demo", exact: true })).toHaveAttribute("data-demo-booking", "");
    await hero.screenshot({ path: testInfo.outputPath(`hero-${width}.png`) });
    expect(errors).toEqual([]);
  });
}

for (const width of [1440, 375]) {
  test(`supplied animation completes and repeats at ${width}px`, async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize({ width, height: 1100 });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/", { waitUntil: "load" });
    const animation = page.locator("#ppim-hh");
    await animation.scrollIntoViewIfNeeded();
    await expect(animation.locator('[data-scene="1"]')).toHaveClass(/is-in/);
    const initialHeight = await animation.evaluate(el => el.getBoundingClientRect().height);
    await expect(animation.locator('[data-scene="2"]')).toHaveClass(/is-in/);
    await expect(animation.locator('.ppim-hh-scene[data-scene="2"]')).toHaveCSS("opacity", "1");
    await animation.screenshot({ path: testInfo.outputPath(`editing-${width}.png`) });
    await expect(animation.locator('[data-scene="3"]')).toHaveClass(/is-in/, { timeout: 60_000 });
    await expect(animation.locator(".ppim-hh-store.is-synced")).toHaveCount(3);
    expect(await animation.evaluate(el => el.getBoundingClientRect().height)).toBeCloseTo(initialHeight, 1);
    await expect(animation.locator('[data-scene="1"]')).toHaveClass(/is-in/);
    expect(errors).toEqual([]);
  });
}

test("animation changes composition at its container breakpoint", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 768, height: 1100 });
  await page.goto("/", { waitUntil: "load" });
  const wrapper = page.locator(".peak-home-hero-animation");
  const animation = wrapper.locator("#ppim-hh");
  await wrapper.evaluate(el => (el as HTMLElement).style.width = "480px");
  await expect(animation).not.toHaveClass(/ppim-hh--m/);
  await wrapper.evaluate(el => (el as HTMLElement).style.width = "479px");
  await expect(animation).toHaveClass(/ppim-hh--m/);
  await expect(animation).toHaveCSS("aspect-ratio", "380 / 500");
});
