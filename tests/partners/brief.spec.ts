import { expect, test } from "@playwright/test";

for (const path of ["/", "/axome/"]) {
  for (const width of [1440, 1024, 768, 375]) {
    test(`${path} at ${width}px`, async ({ page }, testInfo) => {
      const failures: string[] = [];
      page.on("pageerror", (error) => failures.push(error.message));
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toContainText(path.includes("axome") ? "Axome" : "Shopify clients");
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
      await expect(page.locator(".peak-card-grid__card")).toHaveCount(3);
      for (const visual of await page.locator(".peak-card-grid__visual").all()) {
        const frame = await visual.boundingBox();
        const illustration = await visual.locator("[role=img]").boundingBox();
        expect(illustration!.width).toBeGreaterThanOrEqual(frame!.width - 2);
      }
      await expect(page.locator(".peak-assistant-card__approval")).toBeVisible();
      await expect(page.locator("[data-language-suggestion]")).toHaveCount(0);
      await page.screenshot({ path: testInfo.outputPath("full-page.png"), fullPage: true, animations: "disabled" });

      const flow = page.getByRole("link", { name: "See how it works", exact: true });
      await flow.click();
      await expect(page).toHaveURL(/#how-it-works$/);
      await expect(page.locator("#how-it-works")).toBeInViewport();

      const question = page.getByRole("button", { name: "What is Peak PIM?", exact: true });
      await question.focus();
      await page.keyboard.press("Enter");
      await expect(question).toHaveAttribute("aria-expanded", "true");
      await page.keyboard.press("Space");
      await expect(question).toHaveAttribute("aria-expanded", "false");

      const booking = page.locator(".peak-hero a[data-demo-booking]");
      await expect(booking).toHaveAttribute("href", "https://peak-pim.com/book-a-demo/");
      await booking.click();
      const dialog = page.locator("#demo-booking-modal");
      await expect(dialog).toBeVisible();
      await expect(dialog.locator("iframe")).toHaveAttribute("src", /calendar.google.com/);
      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();
      expect(failures).toEqual([]);
    });
  }
}

test("unknown partner is a 404", async ({ page }) => {
  const response = await page.goto("/does-not-exist/", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(404);
});

test("booking retains its real destination without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${process.env.PEAK_PARTNERS_BASE_URL ?? "http://localhost:4323"}/axome/`, { waitUntil: "domcontentloaded" });
  await expect(page.locator(".peak-hero a[data-demo-booking]")).toHaveAttribute("href", "https://peak-pim.com/book-a-demo/");
  await expect(page.locator(".peak-hero")).toBeVisible();
  await context.close();
});
