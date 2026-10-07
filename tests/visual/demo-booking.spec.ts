import { expect, test } from "@playwright/test";

const calendarPath = "/calendar/appointments/schedules/AcZssZ1_QwawE2iAjuSnFFCFE1fNCGIfmZCXXcLDcDZ3QR7o0KuAiTmpX5WJ_TmenVq7M_TFMa4rtD85";
const localizedPaths = ["/fr/reserver-une-demo/", "/de/demo-buchen/", "/es/reservar-demo/", "/it/prenota-demo/", "/nl/demo-boeken/", "/pt-br/agendar-demo/", "/pl/umow-demo/", "/ja/demo-yoyaku/"];

// Deterministic interaction checks use an inert calendar frame. The real Google
// embed is checked separately without selecting or booking an appointment.
test.beforeEach(async ({ page }) => {
  await page.route("**/*", route => {
    const url = new URL(route.request().url());
    if (url.hostname === "localhost") return route.continue();
    if (url.hostname === "calendar.google.com" && url.pathname === calendarPath) return route.fulfill({ contentType: "text/html", body: '<html><body><button>Calendar time selector</button></body></html>' });
    return route.abort();
  });
});

test("booking modal opens lazily, fits responsive viewports and restores keyboard focus", async ({ page }) => {
  for (const width of [1440, 1024, 768, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const trigger = page.locator("#hero [data-demo-booking]");
    const modal = page.locator("#demo-booking-modal");
    const frame = modal.locator("iframe");
    await expect(frame).not.toHaveAttribute("src");
    await expect(trigger).toHaveAttribute("href", "/book-a-demo/");
    await trigger.click();
    await expect(modal).toBeVisible();
    expect(await modal.evaluate(el => el.matches(":modal"))).toBe(true);
    await expect(frame).toHaveAttribute("src", new RegExp(calendarPath + "\\?gv=true&hl=en"));
    await expect(modal.getByRole("button", { name: "Close demo booking" })).toBeFocused();
    expect(await page.locator("html").evaluate(el => getComputedStyle(el).overflow)).toBe("hidden");
    const box = await modal.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    expect(box!.height).toBeLessThanOrEqual(900);
    expect(await modal.evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
    await frame.scrollIntoViewIfNeeded();
    await page.frameLocator("#demo-booking-modal iframe").getByRole("button").focus();
    await page.keyboard.press("Shift+Tab");
    await expect(modal.getByRole("button", { name: "Close demo booking" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(modal).not.toBeVisible();
    await expect(trigger).toBeFocused();
    expect(await page.locator("html").evaluate(el => getComputedStyle(el).overflow)).not.toBe("hidden");
    await trigger.click();
    await modal.getByRole("button", { name: "Close demo booking" }).click();
    await expect(modal).not.toBeVisible();
    await trigger.click();
    await page.mouse.click(2, 2);
    await expect(modal).not.toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  }
});

test("booking is available across shared layouts and keeps chat actions separate", async ({ page }) => {
  for (const path of ["/pricing/", "/shopify-pim-translations/", "/customers/maeli-paris/", "/blog/"]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await page.locator(".site-header [data-demo-booking], .navbar10_component [data-demo-booking]").first().click();
    await expect(page.locator("#demo-booking-modal")).toBeVisible();
    await expect(page.locator("[data-demo-booking][data-open-crisp]")).toHaveCount(0);
    await expect(page.locator("[data-open-crisp]").first()).toBeAttached();
  }
});

test("header has one primary demo CTA on desktop and mobile", async ({ page }) => {
  for (const width of [1440, 768, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const header = page.locator(".site-header");
    if (width < 992) await header.locator(".navbar10_menu-button").click();
    const cta = header.locator(".navbar10_menu-right .button");
    await expect(cta).toHaveCount(1);
    await expect(cta).toHaveText("Demo with your data");
    await expect(cta).not.toHaveClass(/is-secondary/);
    await expect(cta).toHaveAttribute("href", "/book-a-demo/");
    const box = await cta.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    await cta.click();
    await expect(page.locator("#demo-booking-modal")).toBeVisible();
    await page.locator(".peak-demo-modal__close").click();
    await expect(cta).toBeFocused();
  }
});

test("dedicated booking pages are localized with one H1 and the same real calendar", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  for (const path of ["/book-a-demo/", ...localizedPaths]) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response!.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    const section = page.locator("[data-demo-booking-page]");
    await expect(section).toBeVisible();
    await expect(section.locator("iframe")).toHaveAttribute("src", new RegExp(calendarPath));
    if (path !== "/book-a-demo/") {
      await expect(section).not.toContainText("See Peak with your own data");
      await expect(page.locator("#demo-booking-modal")).not.toContainText("Your data, if you want");
    }
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://peak-pim.com${path}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  }
});

test("booking motion respects reduced-motion preference", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.locator("#hero [data-demo-booking]").click();
  expect(await page.locator("#demo-booking-modal").evaluate(el => el.getAnimations().length)).toBe(0);
});


test("booking animates when motion is allowed and remains shareable without JavaScript", async ({ page, browser }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const duration = await page.evaluate(() => {
    document.querySelector<HTMLAnchorElement>("#hero [data-demo-booking]")!.click();
    return document.querySelector("#demo-booking-modal")!.getAnimations()[0]?.effect?.getTiming().duration;
  });
  expect(duration).toBe(220);
  await page.locator(".peak-demo-modal__close").click();
  await expect(page.locator("#demo-booking-modal")).not.toBeVisible();
  const context = await browser.newContext({ javaScriptEnabled: false });
  const fallback = await context.newPage();
  await fallback.route("**/*", route => new URL(route.request().url()).hostname === "localhost" ? route.continue() : route.abort());
  await fallback.goto("http://localhost:4321/", { waitUntil: "domcontentloaded" });
  await fallback.locator("#hero [data-demo-booking]").click();
  await expect(fallback).toHaveURL(/\/book-a-demo\/$/);
  await expect(fallback.locator("[data-demo-booking-page] iframe")).toHaveAttribute("src", new RegExp(calendarPath));
  await context.close();
});
