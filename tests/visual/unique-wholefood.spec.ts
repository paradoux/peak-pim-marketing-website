import { expect, test } from "@playwright/test";

test("Unique Wholefood translations · localized copy fits each viewport", async ({ page }) => {
  for (const path of ["/fr/clients/", "/de/kunden/", "/es/clientes/", "/it/clienti/", "/nl/klanten/", "/pt-br/clientes/", "/pl/klienci/", "/ja/jirei/"]) {
    for (const width of [1440, 768, 375]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`${path}unique-wholefood/`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(300);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator("h1")).not.toHaveText("How Unique Wholefood enriches 10,000+ products");
      const narrative = await page.locator("main").evaluate((main) => Array.from(main.children).filter((section) => !section.classList.contains("peak-testimonial")).map((section) => section.textContent).join(" "));
      expect(narrative).not.toMatch(/Wayne|ウェイン/);
      await expect(page.locator(".peak-testimonial__avatar img")).toHaveAttribute("src", "/assets/testimonials/wayne-choga.png");
      await expect(page.locator(".peak-testimonial__logo, .peak-testimonial .divider-vertical")).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), `${path} at ${width}px`).toBeLessThanOrEqual(1);
    }
  }
});

test("Unique Wholefood story · content, responsive workflow, and keyboard FAQ", async ({ page }) => {
  for (const width of [1440, 1024, 768, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/customers/unique-wholefood/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(300);
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: ".crisp-client, .language-suggestion { display: none !important; }" });
    await expect(page.locator("h1")).toHaveText("How Unique Wholefood enriches 10,000+ products");
    await expect(page.locator(".peak-customer-story-chapter")).toHaveCount(3);
    await expect(page.locator(".peak-enrichment-caption")).toHaveCount(3);
    await expect(page.locator(".peak-testimonial")).toContainText("The AI features make it soo simple");
    await expect(page.locator(".peak-testimonial")).toContainText("Wayne Choga");
    await expect(page.locator(".peak-testimonial__avatar img")).toHaveAttribute("src", "/assets/testimonials/wayne-choga.png");
    await expect(page.locator(".peak-testimonial__logo, .peak-testimonial .divider-vertical")).toHaveCount(0);
    const narrative = await page.locator("main").evaluate((main) => Array.from(main.children).filter((section) => !section.classList.contains("peak-testimonial")).map((section) => section.textContent).join(" "));
    expect(narrative).not.toMatch(/Wayne/);
    for (const visual of await page.locator(".peak-customer-story-chapter__visual").all()) {
      await visual.scrollIntoViewIfNeeded();
      const box = await visual.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    expect(await page.locator("main img").evaluateAll((images) => images.every((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
    const question = page.locator(".faq1_question").first();
    await question.focus();
    await question.press("Enter");
    await expect(question).toHaveAttribute("aria-expanded", "true");
    await question.press("Enter");
    await expect(question).toHaveAttribute("aria-expanded", "false");
  }
});

test("Unique Wholefood menu · discoverable across page families", async ({ page }) => {
  for (const path of ["/", "/bulk-edit/", "/ai-assistant/", "/industry/fashion/", "/vs/shopify-admin/", "/customers/maeli-paris/"]) {
    for (const width of [1440, 768, 375]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(300);
      await page.evaluate(() => document.fonts.ready);
      const closedMenuOverflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      const header = page.locator(".site-header");
      if (width < 992) await header.locator(".navbar10_menu-button").click();
      const toggle = header.locator(".customers-menu-dropdown > .navbar10_dropdown-toggle");
      await toggle.focus();
      await toggle.press("Enter");
      const link = header.locator('.customers-mega-menu__story-link[href="/customers/unique-wholefood/"]');
      await link.scrollIntoViewIfNeeded();
      await expect(link).toBeVisible();
      await expect(link).toContainText("Enrich 10,000+ products with bulk editing and AI.");
      const box = await link.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
      if (width >= 992) expect(box!.y + box!.height).toBeLessThanOrEqual(1000);
      // Existing page content can overflow; opening the shared menu must not add overflow.
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), `${path} at ${width}px`).toBeLessThanOrEqual(Math.max(1, closedMenuOverflow));
    }
  }
});
