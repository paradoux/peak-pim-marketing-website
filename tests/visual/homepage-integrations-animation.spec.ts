import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/*", route => new URL(route.request().url()).hostname === "localhost" ? route.continue() : route.abort());
  await page.addInitScript(() => {
    localStorage.setItem("peak-preferred-locale", location.pathname.startsWith("/fr/") ? "fr" : "en");
    localStorage.setItem("peak-demo-seen", String(Date.now()));
  });
});

for (const width of [1440, 960, 944, 768, 375]) {
  test(`integration diagram fits at ${width}px`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.setViewportSize({ width, height: 1100 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.addStyleTag({ content: "html { scroll-behavior: auto !important; } .site-header { visibility: hidden !important; }" });
    const section = page.locator("#integrations");
    const diagram = section.locator("#ppim-ba");
    await section.scrollIntoViewIfNeeded();
    await expect(section.locator("h2")).toHaveText("Connect Peak to your stack");
    await expect(section.locator(".text-style-tagline")).toHaveCount(0);
    await expect(section.locator(".text-size-medium")).toHaveText("Connect all your sources and sync with every channel and tool your business already uses.");
    await expect(diagram).toHaveAttribute("data-ready", "1");
    await expect(diagram.locator(".ppim-ba-edge")).toHaveCount(8);
    await expect(diagram.locator(".ppim-ba-dest.is-fresh")).toHaveCount(4);
    await expect(diagram.locator(".ppim-ba-live circle")).toHaveCount(0);
    const mobile = await diagram.evaluate(el => el.parentElement!.clientWidth < 860);
    expect(await diagram.evaluate(el => el.classList.contains("ppim-ba--m"))).toBe(mobile);
    const rootBox = (await diagram.boundingBox())!;
    expect(rootBox.width / rootBox.height).toBeCloseTo(mobile ? 380 / 580 : 1200 / 520, 2);
    for (const card of await diagram.locator(".ppim-ba-card, .ppim-ba-pim").all()) {
      const box = (await card.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(rootBox.x - 1);
      expect(box.x + box.width).toBeLessThanOrEqual(rootBox.x + rootBox.width + 1);
      expect(box.y).toBeGreaterThanOrEqual(rootBox.y - 1);
      expect(box.y + box.height).toBeLessThanOrEqual(rootBox.y + rootBox.height + 1);
    }
    await expect(section.getByRole("link", { name: "Learn more" })).toHaveAttribute("href", "/custom-integrations");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
    await section.screenshot({ path: testInfo.outputPath(`integrations-${width}.png`) });
  });
}

test("integration flows animate and resize between desktop and mobile", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 1100 });
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/", { waitUntil: "networkidle" });
  const diagram = page.locator("#ppim-ba");
  await diagram.scrollIntoViewIfNeeded();
  await expect(diagram.locator('[data-id="us"] em')).toHaveText("Winter prices live", { timeout: 20000 });
  await page.setViewportSize({ width: 375, height: 1100 });
  await expect(diagram).toHaveClass(/ppim-ba--m/);
  await diagram.scrollIntoViewIfNeeded();
  await expect(diagram.locator('[data-id="eu"] em')).toHaveText("2,847 products in French", { timeout: 20000 });
  await page.setViewportSize({ width: 1440, height: 1100 });
  await expect(diagram).not.toHaveClass(/ppim-ba--m/);
  await expect(diagram.locator(".ppim-ba-edge")).toHaveCount(8);
  expect(errors).toEqual([]);
});

test("integration animation is shown in the gallery and localized homepage", async ({ page }) => {
  for (const path of ["/design-system/", "/fr/"]) {
    await page.goto(path, { waitUntil: "networkidle" });
    await expect(page.locator("#ppim-ba[data-ready='1']")).toHaveCount(1);
    await expect(page.locator("#ppim-ba")).toHaveAttribute("lang", "en");
    if (path === "/fr/") await expect(page.locator("#integrations h2")).toHaveText("Connectez Peak à vos outils");
  }
});
