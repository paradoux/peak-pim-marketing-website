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

      const ids = ["hero", "problem", "solution", "implementation", "partnership", "contact"];
      expect(await page.locator("main > [id]").evaluateAll(nodes => nodes.map(node => node.id))).toEqual(ids);
      const header = page.locator(".peak-one-pager-header");
      for (const link of await header.locator("a").all()) expect(await link.getAttribute("href")).toMatch(/^#/);
      await expect(page.locator(".site-footer")).toHaveCount(0);
      await expect(page.locator("#partnership")).toContainText("percentage depends on the deal");
      await expect(page.locator("#contact a[href='mailto:theau@peak-pim.com']")).toBeVisible();
      await expect(page.locator("#contact a[href='https://www.linkedin.com/in/theau/']")).toBeVisible();
      await expect(page.locator("#contact a[href='https://peak-pim.com/']")).toBeVisible();
      if (path.includes("axome")) {
        await expect(page.locator(".peak-partner-brand img[alt='Axome']")).toBeVisible();
        expect(await page.locator(".peak-partner-brand img[alt='Axome']").evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      }
      const flow = page.getByRole("link", { name: "See how it works", exact: true });
      await flow.click();
      await expect(page).toHaveURL(/#implementation$/);
      await expect(page.locator("#implementation")).toBeInViewport();
      if (width < 992) {
        const summary = header.locator("summary");
        await summary.focus();
        await page.keyboard.press("Enter");
        await expect(header.locator("details")).toHaveAttribute("open", "");
        await page.keyboard.press("Escape");
        await expect(header.locator("details")).not.toHaveAttribute("open");
        await summary.click();
        await header.locator("details").getByRole("link", { name: "Contact", exact: true }).click();
        await expect(header.locator("details")).not.toHaveAttribute("open");
      } else {
        await header.getByRole("link", { name: "Contact", exact: true }).click();
      }
      await expect(page).toHaveURL(/#contact$/);
      await expect(page.locator("#contact")).toBeInViewport();
      expect(await page.locator("#contact").evaluate(el => el.getBoundingClientRect().top)).toBeGreaterThanOrEqual(60);
      expect(failures).toEqual([]);
    });
  }
}

test("unknown partner is a 404", async ({ page }) => {
  const response = await page.goto("/does-not-exist/", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(404);
});

test("section navigation and contact work without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  await page.goto(`${process.env.PEAK_PARTNERS_BASE_URL ?? "http://localhost:4323"}/axome/`, { waitUntil: "domcontentloaded" });
  await page.locator(".peak-one-pager-header summary").click();
  await page.locator(".peak-one-pager-header details").getByRole("link", { name: "Contact", exact: true }).click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.locator("#contact a[href='mailto:theau@peak-pim.com']")).toBeVisible();
  await context.close();
});
