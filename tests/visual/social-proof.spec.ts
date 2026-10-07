import { expect, test } from "@playwright/test";

const paths = ["/", "/pricing/", "/shopify-product-management/", "/shopify-multi-store-pim/", "/build-vs-buy-pim/", "/industry/fashion/", "/design-system/"];

for (const path of paths) {
  test(`open cream proof · ${path}`, async ({ page }) => {
    for (const width of [1440, 1024, 768, 375]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await page.addStyleTag({ content: ".crisp-client, .language-suggestion { display: none !important; }" });
      await page.evaluate(() => document.fonts.ready);
      const proof = page.locator(".peak-social-proof-stats");
      await proof.scrollIntoViewIfNeeded();
      await expect(proof.locator(".peak-social-proof-stats__logo-link")).toHaveCount(6);
      await expect(proof.locator('.peak-social-proof-stats__logo-link[target="_blank"]')).toHaveCount(4);
      await expect(proof.locator(".logo2_case-study-badge")).toHaveCount(2);
      expect(await proof.locator(".peak-social-proof-stats__component").evaluate(el => getComputedStyle(el).borderTopWidth)).toBe("0px");
      expect(await proof.locator(".peak-social-proof-stats__value").first().evaluate(el => getComputedStyle(el).color)).toBe("rgb(26, 26, 26)");
      const heading = await proof.locator("h2").boundingBox();
      const numbers = await proof.locator(".peak-social-proof-stats__numbers").boundingBox();
      if (width > 991) expect(numbers!.x).toBeGreaterThan(heading!.x + heading!.width);
      else expect(numbers!.y).toBeGreaterThanOrEqual(heading!.y + heading!.height);

      for (const slug of ["maeli-paris", "du-bruit-dans-la-cuisine"]) {
        const link = proof.locator(`.peak-social-proof-stats__logo-link[href="/customers/${slug}/"]`);
        const card = link.locator("..").locator(".logo2_case-study-card");
        await expect(link).not.toHaveAttribute("target");
        await link.focus();
        if (width >= 768) {
          await expect(card).toBeVisible();
          const box = await card.boundingBox();
          expect(box!.x).toBeGreaterThanOrEqual(0);
          expect(box!.x + box!.width).toBeLessThanOrEqual(width);
          await page.keyboard.press("Tab");
          await expect(card.locator("a")).toBeFocused();
          await expect(card.locator("a")).toHaveAttribute("href", `/customers/${slug}/`);
          await page.keyboard.press("Tab");
          await page.mouse.move(0, 0);
          await expect(card).not.toBeVisible();
          await link.hover();
          await expect(card).toBeVisible();
        } else {
          await expect(card).not.toBeVisible();
          await link.click();
          await expect(page).toHaveURL(new RegExp(`/customers/${slug}/?$`));
          await page.goBack({ waitUntil: "domcontentloaded" });
        }
      }
      await page.mouse.move(0, 0);
      expect(await proof.evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
    }
  });
}
