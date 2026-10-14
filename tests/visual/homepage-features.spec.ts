import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/*", route => new URL(route.request().url()).hostname === "localhost" ? route.continue() : route.abort());
  await page.addInitScript(() => localStorage.setItem("peak-preferred-locale", "en"));
});

for (const width of [1440, 1024, 768, 375]) {
  test(`feature tabs switch complete, stable previews at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1500 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/#features", { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
    const section = page.locator("#features");
    const benefits = page.locator("section").filter({ has: page.getByRole("heading", { name: "Built for Shopify, made for the job", exact: true }) });
    await expect(benefits.locator(".layout395_card")).toHaveCount(3);
    await expect(benefits.locator("h3")).toHaveText(["Shopify native", "Made for the job", "Multi-store ready"]);
    expect(await section.evaluate(node => {
      let next = node.nextElementSibling;
      while (next && next.tagName !== "SECTION") next = next.nextElementSibling;
      return next?.textContent?.includes("Built for Shopify, made for the job");
    })).toBe(true);
    const tabs = section.getByRole("tab");
    await expect(tabs).toHaveText(["Multi-stores", "Bulk Edit", "Media Management", "Drops", "Automations"]);
    let firstTop = 0;
    for (let i = 0; i < 5; i++) {
      await tabs.nth(i).click();
      await expect(section.getByRole("tab", { selected: true })).toHaveCount(1);
      const panel = section.getByRole("tabpanel");
      await expect(panel).toHaveCount(1);
      await expect(panel).toHaveAccessibleName(await tabs.nth(i).innerText());
      await expect(panel.locator("h3")).toHaveCount(0);
      await expect(panel.locator(".peak-home-features__caption p")).toHaveText(["Manage data across all your Shopify stores from a single dashboard.", "Edit hundreds of products, files, collections, metafields and more at once.", "Upload, organize, and assign files across your catalog from a single media library.", "Schedule changes and automatic rollbacks.", "Run repeatable catalog workflows automatically."][i]);
      const captionBox = (await panel.locator(".peak-home-features__caption").boundingBox())!;
      const navigationBox = (await section.locator(".peak-home-features__navigation").boundingBox())!;
      const stageBox = (await panel.locator(".peak-home-features__stage").boundingBox())!;
      expect(captionBox.y).toBeGreaterThanOrEqual(navigationBox.y + navigationBox.height);
      expect(captionBox.y + captionBox.height).toBeLessThan(stageBox.y);
      const geometry = await panel.locator(".peak-home-features__stage").evaluate(stage => {
        const box = stage.getBoundingClientRect();
        const art = stage.querySelector(".peak-home-features__capture-frame")!.getBoundingClientRect();
        return { x: box.x, width: box.width, height: box.height, top: box.top + scrollY, artX: art.x, artY: art.y, y: box.y, artWidth: art.width, artHeight: art.height };
      });
      expect(geometry.artX).toBeGreaterThan(geometry.x);
      expect(geometry.artY).toBeGreaterThan(geometry.y);
      expect(geometry.artWidth).toBeLessThan(geometry.width);
      expect(geometry.artHeight).toBeLessThan(geometry.height);
      if (i === 4) await expect(panel.getByText("Coming soon", { exact: true })).toBeVisible();
      const capture = panel.locator(".peak-home-features__capture img");
      const file = ["multi-store", "bulk-edit", "media-management", "drops", "automations"][i];
      await expect(capture).toHaveAttribute("src", `/assets/product-ui/${file}-product-view.png`);
      await expect(capture).toBeVisible();
      await expect.poll(() => capture.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      expect(await capture.evaluate((img: HTMLImageElement) => {
        const frame = img.closest(".peak-home-features__stage")!.getBoundingClientRect();
        const box = img.getBoundingClientRect();
        return box.top >= frame.top && box.bottom <= frame.bottom && Math.abs(box.width / box.height - img.naturalWidth / img.naturalHeight) < 0.01;
      })).toBe(true);
      if (i === 0) firstTop = geometry.top;
      expect(geometry.top).toBeCloseTo(firstTop, 0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await section.screenshot({ path: testInfo.outputPath(`features-${width}-${i}.png`) });
    }
    expect(errors).toEqual([]);
    await expect(section.getByRole("link", { name: "Get Peak PIM", exact: true })).toHaveCount(0);
    const backgrounds = await section.locator(".peak-home-features__stage").evaluateAll(stages => stages.map(stage => {
      const style = getComputedStyle(stage);
      return [style.backgroundColor, style.backgroundImage, style.backgroundSize];
    }));
    expect(backgrounds.every(background => JSON.stringify(background) === JSON.stringify(backgrounds[4]))).toBe(true);
    expect(backgrounds[0][0]).toBe("rgb(26, 26, 26)");
    const ids = await section.locator("[id]").evaluateAll(nodes => nodes.map(node => node.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
}

test("feature tabs support keyboard navigation and keep the page in place", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 1000 });
  await page.goto("/#features", { waitUntil: "networkidle" });
  const tabs = page.locator("#features").getByRole("tab");
  await tabs.first().scrollIntoViewIfNeeded();
  await tabs.first().focus();
  await expect(tabs.first()).toBeFocused();
  const scrollY = await page.evaluate(() => window.scrollY);
  await page.keyboard.press("End");
  await expect(tabs.last()).toBeFocused();
  await expect(tabs.last()).toHaveAttribute("aria-selected", "true");
  await expect(tabs.last()).toBeInViewport({ ratio: 1 });
  expect(await page.evaluate(() => window.scrollY)).toBeCloseTo(scrollY, 0);
  await page.keyboard.press("ArrowRight");
  await expect(tabs.first()).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(tabs.first()).toBeFocused();
  await page.keyboard.press("End");
  await page.keyboard.press("Home");
  await expect(tabs.first()).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Explore all", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator("#features").getByRole("tabpanel")).toBeFocused();
});

for (const width of [1440, 768, 375]) {
  test(`Explore all opens the existing Features navigation at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#features", { waitUntil: "networkidle" });
    const explore = page.getByRole("button", { name: "Explore all", exact: true });
    await explore.scrollIntoViewIfNeeded();
    const scrollY = await page.evaluate(() => window.scrollY);
    await explore.click();
    const toggle = page.locator(".feature-menu-dropdown .navbar10_dropdown-toggle");
    const menu = page.locator(".feature-menu-dropdown .navbar10_dropdown-list");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(toggle).toBeFocused();
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("link", { name: /Bulk edit/ })).toBeVisible();
    expect(await page.evaluate(() => window.scrollY)).toBeCloseTo(scrollY, 0);
    if (width < 992) await expect(page.locator(".navbar10_menu-button")).toHaveAttribute("aria-expanded", "true");
    await page.screenshot({ path: testInfo.outputPath(`explore-all-${width}.png`) });
    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    if (width < 992) await page.locator(".navbar10_menu-button").click();
    await explore.focus();
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
  });
}

test("feature showcase preserves translated copy and is in the design catalogue", async ({ page }) => {
  await page.goto("/fr/", { waitUntil: "networkidle" });
  const section = page.locator("#features");
  await expect(section.getByRole("tab")).toHaveCount(5);
  await expect(section.locator("h2")).not.toHaveText("Powerful features");
  await expect(section.getByRole("button", { name: "Tout explorer", exact: true })).toBeVisible();
  await expect(section.getByRole("tab").first()).not.toHaveText("Multi-stores");
  await expect(section.getByRole("tabpanel").locator("p")).not.toContainText("Manage product information");
  await expect(section.getByRole("tabpanel").locator("p")).not.toContainText("Changes propagate instantly.");
  await section.getByRole("tab").last().click();
  await expect(section.getByRole("tabpanel")).toBeVisible();
  await expect(section.getByRole("tabpanel").locator("p")).not.toContainText("Run repeatable catalog workflows automatically.");
  await expect(section.getByRole("tabpanel").locator(".feature-status-badge")).not.toHaveText("Coming soon");
  await expect(section.getByRole("tabpanel").locator("p")).not.toContainText("Manage product information");
  await expect(section.getByRole("tabpanel").locator("p")).not.toContainText("Changes propagate instantly.");
  await page.goto("/design-system/", { waitUntil: "networkidle" });
  await expect(page.locator("#features").getByRole("tab")).toHaveCount(5);
});
