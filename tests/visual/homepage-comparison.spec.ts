import { expect, test } from "@playwright/test";

for (const width of [1440, 768, 375]) {
  test(`homepage comparison is readable before the customer story at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1100 });
    await page.route("**/*", route => new URL(route.request().url()).hostname === "localhost" ? route.continue() : route.abort());
    await page.addInitScript(() => {
      localStorage.setItem("peak-preferred-locale", "en");
      localStorage.setItem("peak-demo-seen", String(Date.now()));
    });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
    await page.evaluate(() => document.fonts.ready);
    const section = page.locator("#compare");
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole("table")).toBeVisible();
    await expect(section.locator("h2")).toHaveText("Your best option");
    await expect(section.locator(".text-size-medium")).toHaveText("Compare Peak with the two most common alternatives: an enterprise PIM or a patchwork of apps. See what changes for your team.");
    await expect(page.locator(".section_pricing2")).toHaveCount(0);
    await expect(section.getByRole("row")).toHaveCount(8);
    const bulkEditRow = section.getByRole("row").filter({ has: page.getByRole("rowheader", { name: "Bulk edit", exact: true }) });
    await expect(bulkEditRow.getByRole("img", { name: "Yes", exact: true })).toHaveCount(3);
    const workflowRow = section.getByRole("row").filter({ has: page.getByRole("rowheader", { name: "Catalog workflows in one tool", exact: true }) });
    await expect(workflowRow.getByRole("img", { name: "Yes", exact: true })).toHaveCount(2);
    await expect(workflowRow.getByRole("img", { name: "No", exact: true })).toHaveCount(1);
    await expect(section.getByText("Depends on apps", { exact: true })).toHaveCount(2);
    await expect(section.getByText("From Elite", { exact: true })).toBeVisible();
    await expect(section.getByAltText("Peak PIM", { exact: true })).toBeVisible();
    await expect(section.getByAltText("Akeneo", { exact: true })).toBeVisible();
    const stack = section.getByRole("columnheader", { name: "Shopify + a patchwork of apps", exact: true });
    await expect(stack).toBeVisible();
    await expect(stack.locator("img")).toHaveCount(5);
    await expect(stack.getByRole("img", { name: "5 more apps", exact: true })).toBeVisible();
    expect(await stack.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    const appBoxes = await stack.locator(".peak-home-comparison__app-icons img").evaluateAll(images => images.map(image => {
      const { x, y, width, height } = image.getBoundingClientRect();
      return { x, y, width, height };
    }));
    const shopifyBox = await stack.getByAltText("Shopify", { exact: true }).boundingBox();
    expect(shopifyBox!.y + shopifyBox!.height / 2).toBeCloseTo(appBoxes[0].y + appBoxes[0].height / 2, 0);
    {
      const countBox = await stack.getByRole("img", { name: "5 more apps", exact: true }).boundingBox();
      expect(countBox!.width).toBeCloseTo(countBox!.height, 0);
      expect(countBox!.y + countBox!.height / 2).toBeCloseTo(appBoxes[0].y + appBoxes[0].height / 2, 0);
    }
    for (let index = 1; index < appBoxes.length; index++) {
      expect(appBoxes[index].y).toBeCloseTo(appBoxes[0].y, 0);
      expect(appBoxes[index].x).toBeLessThan(appBoxes[index - 1].x + appBoxes[index - 1].width);
      expect(appBoxes[index].x).toBeGreaterThan(appBoxes[index - 1].x);
    }
    for (const name of ["Shopify", "Matrixify", "Syncio", "Booster SEO", "Transcy"]) {
      await expect(stack.getByAltText(name, { exact: true })).toBeVisible();
    }
    await expect(stack).not.toContainText("patchwork");
    await expect(section).not.toContainText("Product comparison");
    await expect(section.locator(".comparison11_top-row-title")).toHaveText("Solution");
    await expect(section.locator("details")).toHaveCount(0);
    await expect(section).not.toContainText("Plytix");
    await expect(section).not.toContainText("$25,000");
    await expect(section.getByRole("row").filter({ hasText: "Starting price" })).toContainText("$49/mo");
    expect(await section.evaluate(el => el.nextElementSibling?.classList.contains("peak-customer-story-hero"))).toBe(true);
    for (const image of await section.locator("img").all()) {
      await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await section.getByRole("cell").evaluateAll(cells => cells.every(cell => cell.scrollWidth <= cell.clientWidth + 1))).toBe(true);
    if (width === 375) {
      const row = section.getByRole("row").nth(1);
      const label = await row.getByRole("rowheader").boundingBox();
      const cell = await row.getByRole("cell").first().boundingBox();
      expect(label!.y + label!.height).toBeLessThanOrEqual(cell!.y + 1);
    }
    await section.scrollIntoViewIfNeeded();
    await page.addStyleTag({ content: ".site-header { visibility: hidden !important; }" });
    await section.screenshot({ path: testInfo.outputPath(`comparison-${width}.png`) });
  });
}
