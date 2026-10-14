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
    await expect(cards).toHaveCount(7);
    await expect(cards.nth(2).getByRole("heading")).toHaveText("Create your own workflow");
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

test("workflow marquee loops more slowly than logos and pauses for reading", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/", { waitUntil: "load" });
  const section = page.locator("#workflows");
  const row = section.getByRole("region");
  const track = section.locator(".peak-home-workflows__track");
  await section.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const speed = await track.evaluate(el => el.getBoundingClientRect().width / 2 / parseFloat(getComputedStyle(el).animationDuration));
  const logoSpeed = await page.locator(".peak-logo-marquee__track").first().evaluate(el => el.getBoundingClientRect().width / 2 / parseFloat(getComputedStyle(el).animationDuration));
  expect(speed).toBeLessThan(logoSpeed);
  expect(await row.evaluate(el => getComputedStyle(el).maskImage)).toBe("none");
  expect(await row.evaluate(el => getComputedStyle(el).scrollbarWidth)).toBe("none");
  const groups = section.locator(".peak-home-workflows__group");
  await expect(groups).toHaveCount(2);
  await expect(groups.last()).toHaveAttribute("aria-hidden", "true");
  await expect(groups.last()).toHaveAttribute("inert", "");
  await expect(groups.last().locator("[id]")).toHaveCount(0);
  expect(await groups.evaluateAll(elements => (elements[0] as HTMLElement).offsetWidth === (elements[1] as HTMLElement).offsetWidth)).toBe(true);
  const initial = await track.evaluate(el => getComputedStyle(el).transform);
  await expect.poll(() => track.evaluate(el => getComputedStyle(el).transform)).not.toBe(initial);
  await row.hover();
  expect(await track.evaluate(el => getComputedStyle(el).animationName)).toBe("none");
  expect(await row.evaluate(el => el === document.activeElement)).toBe(false);
  const beforeWheel = await row.evaluate(el => el.scrollLeft);
  await page.mouse.wheel(240, 0);
  await expect.poll(() => row.evaluate(el => el.scrollLeft)).toBeGreaterThan(beforeWheel + 150);
  expect(await row.evaluate(el => getComputedStyle(el).maskImage)).toBe("none");
  await row.click({ position: { x: 180, y: 100 } });
  expect(await row.evaluate(el => getComputedStyle(el).maskImage)).toBe("none");
  const beforeResume = await section.getByRole("article").first().evaluate(el => ({ x: el.getBoundingClientRect().x, time: performance.now() }));
  await page.mouse.move(0, 0);
  await expect.poll(() => track.evaluate(el => getComputedStyle(el).animationName)).toBe("peak-logo-marquee-scroll");
  const afterResume = await section.getByRole("article").first().evaluate(el => ({ x: el.getBoundingClientRect().x, time: performance.now() }));
  expect(Math.abs(afterResume.x - beforeResume.x)).toBeLessThanOrEqual(speed * (afterResume.time - beforeResume.time) / 1000 + 2);
  await row.hover();
  await row.evaluate(el => { el.scrollLeft = 0; });
  await page.addStyleTag({ content: '.site-header { visibility: hidden !important; }' });
  await section.screenshot({ path: testInfo.outputPath("workflow-marquee.png") });
  await row.evaluate(el => el.blur());
  await page.mouse.move(0, 0);
  await row.focus();
  expect(await track.evaluate(el => getComputedStyle(el).animationName)).toBe("none");
  expect(await row.evaluate(el => getComputedStyle(el).maskImage)).toBe("none");
  await section.getByRole("article").last().scrollIntoViewIfNeeded();
  await row.evaluate(el => el.blur());
  expect(await row.evaluate(el => el.scrollLeft)).toBe(0);
  expect(await track.evaluate(el => getComputedStyle(el).animationPlayState)).toBe("running");
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
    await expect(cards).toHaveCount(7);
    const track = section.locator(".peak-home-workflows__track");
    expect(await track.evaluate(el => getComputedStyle(el).animationName)).toBe("peak-logo-marquee-scroll");
    const initial = await track.evaluate(el => getComputedStyle(el).transform);
    await expect.poll(() => track.evaluate(el => getComputedStyle(el).transform)).not.toBe(initial);
    const bounds = (await row.boundingBox())!;
    const client = await page.context().newCDPSession(page);
    await client.send("Input.synthesizeScrollGesture", {
      x: 300, y: Math.min(bounds.y + 120, 650), xDistance: -240, yDistance: 0, gestureSourceType: "touch",
    });
    await expect.poll(() => track.evaluate(el => getComputedStyle(el).animationName)).toBe("peak-logo-marquee-scroll");
    expect(await track.evaluate(el => -new DOMMatrix(getComputedStyle(el).transform).m41)).toBeGreaterThan(150);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await row.tap();
    await expect.poll(() => track.evaluate(el => getComputedStyle(el).animationName)).toBe("peak-logo-marquee-scroll");
    // Capture readable, static screenshots using the user's reduced-motion setting.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(section.locator('.peak-home-workflows__group[aria-hidden]')).toBeHidden();
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
