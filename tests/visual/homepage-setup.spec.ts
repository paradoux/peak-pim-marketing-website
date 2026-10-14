import { expect, test } from "@playwright/test";

for (const width of [1440, 768, 375]) {
  test(`homepage setup links and steps work at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1100 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.route("**/*", route => new URL(route.request().url()).hostname === "localhost" ? route.continue() : route.abort());
    await page.addInitScript(() => {
      localStorage.setItem("peak-preferred-locale", "en");
      localStorage.setItem("peak-demo-seen", String(Date.now()));
    });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
    const section = page.locator("section").filter({ has: page.getByRole("heading", { name: "How to get started", exact: true }) });
    const steps = section.locator(".layout121_timeline-right");
    await expect(steps.locator("h3")).toHaveText([
      "Connect your first store", "Add your other sources", "Set up your first workflow", "Publish to Shopify",
    ]);
    await expect(section.getByRole("link", { name: "Connect a store", exact: true })).toHaveAttribute("href", "https://apps.shopify.com/peak-pim");
    await expect(steps.first().getByRole("link", { name: "Install Peak PIM" })).toHaveAttribute("href", "https://apps.shopify.com/peak-pim");
    await expect(steps.nth(1)).toContainText("spreadsheets, your ERP, or additional stores");
    await expect(steps.last().locator("p")).toHaveText("Hit save and watch changes propagate to every connected store instantly.");
    await section.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.addStyleTag({ content: ".site-header { visibility: hidden !important; }" });
    await section.screenshot({ path: testInfo.outputPath(`setup-${width}.png`) });
    const demo = steps.nth(1).getByRole("link", { name: "Book a demo", exact: true });
    await expect(demo).toHaveAttribute("href", "/book-a-demo/");
    await demo.click();
    await expect(page.locator("#demo-booking-modal")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#demo-booking-modal")).not.toBeVisible();
  });
}
