import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/*", route => new URL(route.request().url()).hostname === "localhost" ? route.continue() : route.abort());
  await page.addInitScript(() => localStorage.setItem("peak-preferred-locale", "en"));
});

for (const width of [1440, 1101, 1024, 992, 768, 767, 390, 375, 320]) {
  test(`dark workflow cards remain accessible in one row at ${width}px`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width, height: 1100 });
    await page.goto("/", { waitUntil: "load" });
    const section = page.locator("#workflows");
    const row = section.getByRole("region");
    const cards = section.getByRole("article");
    await expect(section).toBeVisible();
    await section.scrollIntoViewIfNeeded();
    await page.evaluate(() => document.fonts.ready);
    expect(await section.evaluate(el => el.previousElementSibling?.id)).toBe("outcomes");
    await expect(section.getByRole("heading", { level: 2 })).toHaveText("Run your catalog from one place");
    await expect(cards).toHaveCount(13);
    await expect(cards.nth(2).getByRole("heading")).toHaveText("Create your own workflow");
    expect((await cards.getByRole("heading").allTextContents()).slice(7)).toEqual([
      "Keep every store consistent", "Give your retailers their own prices", "Open a new store without starting over",
      "Update your size guide once", "Add size-specific data to every variant", "Send a marketplace the file it expects",
    ]);
    await expect(cards.nth(2).getByRole("heading")).toHaveCSS("text-align", "center");
    if (width >= 992) {
      expect(await section.getByRole("heading", { level: 2 }).evaluate(el => {
        const range = document.createRange();
        range.selectNodeContents(el);
        return range.getClientRects().length;
      })).toBe(1);
    }
    const createIcon = cards.nth(2).locator(".peak-home-workflows__create-icon");
    await expect(createIcon).toHaveText("+");
    expect(await createIcon.evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(150);
    await expect(cards.nth(2).locator("p")).toHaveCount(0);
    await expect(section.locator(".peak-home-workflows__tag")).toHaveCount(0);
    await expect(section.locator("a, button, img, svg, canvas")).toHaveCount(0);
    await expect(section.getByRole("list", { name: "Workflow steps" })).toHaveCount(0);
    const boxes = await cards.evaluateAll(elements => elements.map(el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; }));
    expect(boxes.every(box => Math.abs(box.y - boxes[0].y) < 1 && Math.abs(box.width - boxes[0].width) < 1 && Math.abs(box.height - boxes[0].height) < 1), JSON.stringify(boxes)).toBe(true);
    expect(boxes.every((box, i) => i === 0 || box.x > boxes[i - 1].x + boxes[i - 1].width)).toBe(true);
    expect(await cards.evaluateAll(elements => elements.every(el => getComputedStyle(el).backgroundColor === "rgb(26, 26, 26)" && getComputedStyle(el).color === "rgb(255, 255, 255)"))).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const rowBounds = await row.boundingBox();
    expect(rowBounds!.x).toBeCloseTo(0, 0);
    expect(rowBounds!.width).toBeCloseTo(width, 0);
    expect(await cards.evaluateAll(elements => elements.every(el => getComputedStyle(el).borderWidth === "0px"))).toBe(true);
    expect(await section.locator(".peak-home-workflows__track").evaluate(el => getComputedStyle(el).animationName)).toBe("none");
    await row.focus();
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => row.evaluate(el => el.scrollLeft)).toBeGreaterThan(0);
    await cards.last().scrollIntoViewIfNeeded();
    await expect(cards.last()).toBeInViewport({ ratio: .99 });
    expect(await section.textContent()).not.toMatch(/\u2014|\bPeak\b(?! PIM)|\b(stock|inventory|beta|game-changer|revolutionary|unlocks)\b|free plan/i);
  });
}

test("workflow marquee recycles unique cards continuously and pauses for reading", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/", { waitUntil: "load" });
  const section = page.locator("#workflows");
  const row = section.getByRole("region");
  const cards = section.locator("article");
  await row.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await expect(cards).toHaveCount(13);
  await expect(section.locator(".peak-home-workflows__group")).toHaveCount(1);
  const initial = await row.evaluate(el => ({ x: el.scrollLeft, time: performance.now() }));
  await expect.poll(() => row.evaluate(el => el.scrollLeft)).toBeGreaterThan(initial.x + 5);
  const moved = await row.evaluate(el => ({ x: el.scrollLeft, time: performance.now() }));
  const speed = (moved.x - initial.x) / (moved.time - initial.time) * 1000;
  const logoSpeed = await page.locator(".peak-logo-marquee__track").first().evaluate(el => el.getBoundingClientRect().width / 2 / parseFloat(getComputedStyle(el).animationDuration));
  expect(speed).toBeGreaterThan(0);
  expect(speed).toBeLessThan(14);
  expect(speed).toBeLessThan(logoSpeed);
  await row.hover();
  const paused = await row.evaluate(el => el.scrollLeft);
  await page.waitForTimeout(150);
  expect(await row.evaluate(el => el.scrollLeft)).toBe(paused);
  await page.mouse.wheel(240, 0);
  await expect.poll(() => row.evaluate(el => el.scrollLeft)).toBeGreaterThan(paused + 150);

  // Exercise a complete cycle, preserving the same nodes and visible geometry.
  const originalOrder = await cards.getByRole("heading").allTextContents();
  for (let i = 0; i < 13; i++) {
    await row.hover();
    const first = await cards.first().getAttribute("aria-labelledby");
    const nextId = await cards.nth(1).getAttribute("aria-labelledby");
    await row.evaluate(el => {
      const children = el.querySelectorAll<HTMLElement>("article");
      el.scrollLeft = children[1].offsetLeft - children[0].offsetLeft + 10;
    });
    const next = section.locator(`article[aria-labelledby="${nextId}"]`);
    const before = await next.evaluate(el => ({ x: el.getBoundingClientRect().x, time: performance.now() }));
    await page.mouse.move(0, 0);
    await expect(cards.last()).toHaveAttribute("aria-labelledby", first!);
    const after = await next.evaluate(el => ({ x: el.getBoundingClientRect().x, time: performance.now() }));
    expect(Math.abs(after.x - before.x)).toBeLessThan(14 * (after.time - before.time) / 1000 + 2);
    await expect(cards).toHaveCount(13);
  }
  expect(await cards.getByRole("heading").allTextContents()).toEqual(originalOrder);
  await row.focus();
  const focused = await row.evaluate(el => el.scrollLeft);
  await page.waitForTimeout(150);
  expect(await row.evaluate(el => el.scrollLeft)).toBe(focused);
});

test("English preview remains absent on localized pages", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/fr/", { waitUntil: "load" });
  await expect(page.locator("#workflows")).toHaveCount(0);
});


test.describe("mobile touch navigation", () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  test("phone cards autoplay and resume after swiping without page overflow", async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/", { waitUntil: "load" });
    const section = page.locator("#workflows");
    const row = section.getByRole("region");
    const cards = section.getByRole("article");
    await row.scrollIntoViewIfNeeded();
    await expect(cards).toHaveCount(13);
    const initial = await row.evaluate(el => el.scrollLeft);
    await expect.poll(() => row.evaluate(el => el.scrollLeft)).toBeGreaterThan(initial);
    const bounds = (await row.boundingBox())!;
    const client = await page.context().newCDPSession(page);
    await client.send("Input.synthesizeScrollGesture", {
      x: 300, y: Math.min(bounds.y + 120, 650), xDistance: -240, yDistance: 0, gestureSourceType: "touch",
    });
    await expect.poll(() => row.evaluate(el => el.scrollLeft)).toBeGreaterThan(150);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await row.tap();
    const afterTap = await row.evaluate(el => el.scrollLeft);
    await expect.poll(() => row.evaluate(el => el.scrollLeft)).toBeGreaterThan(afterTap);
    // Capture readable, static screenshots using the user's reduced-motion setting.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(section.locator("article")).toHaveCount(13);
    await row.evaluate(el => { el.scrollLeft = 0; });
    await expect.poll(() => row.evaluate(el => el.scrollLeft)).toBe(0);
    await page.addStyleTag({ content: '.site-header { visibility: hidden !important; }' });
    await section.screenshot({ path: testInfo.outputPath("workflow-mobile.png") });
    await cards.nth(2).scrollIntoViewIfNeeded();
    await expect(cards.nth(2)).toBeInViewport({ ratio: .99 });
    await row.screenshot({ path: testInfo.outputPath("workflow-mobile-create.png") });
    await cards.last().scrollIntoViewIfNeeded();
    await expect(cards.last()).toBeInViewport({ ratio: .99 });
  });
});
