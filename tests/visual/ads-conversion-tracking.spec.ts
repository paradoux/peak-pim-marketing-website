import { expect, test } from "@playwright/test";

const landingPages = ["/shopify-multi-store-pim/", "/bulk-edit/", "/shopify-pim-alternatives/"];
const campaignQuery =
  "utm_source=chatgpt&utm_medium=paid&utm_campaign=us-english-pilot&utm_content=catalog-operations&utm_term=shopify-pim";

async function expectShopifyAttribution(page: import("@playwright/test").Page) {
  const destination = await page
    .locator('a[href^="https://apps.shopify.com/peak-pim"]')
    .first()
    .getAttribute("href");

  expect(destination).not.toBeNull();
  const url = new URL(destination!);
  expect(Object.fromEntries(url.searchParams)).toMatchObject({
    utm_source: "chatgpt",
    utm_medium: "paid",
    utm_campaign: "us-english-pilot",
    utm_content: "catalog-operations",
    utm_term: "shopify-pim",
  });
}

for (const path of landingPages) {
  test(`records the agreed conversion actions on ${path}`, async ({ page }) => {
    await page.route("https://bzrcdn.openai.com/sdk/oaiq.min.js", (route) =>
      route.fulfill({ status: 200, contentType: "application/javascript", body: "" }),
    );

    await page.goto(`${path}?${campaignQuery}`);

    await expect(page.locator('script[src="https://bzrcdn.openai.com/sdk/oaiq.min.js"]')).toHaveCount(1);
    await expectShopifyAttribution(page);

    const events = await page.evaluate(() => {
      const trackedWindow = window as typeof window & {
        $crisp: unknown[][];
        oaiq: { q: IArguments[] };
      };
      const shopifyLink = document.querySelector<HTMLAnchorElement>('a[href^="https://apps.shopify.com/peak-pim"]');
      if (!shopifyLink) throw new Error("Expected a Peak PIM Shopify listing link.");

      shopifyLink.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      shopifyLink.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

      for (const crispEvent of ["chat:opened", "message:sent"]) {
        const registration = trackedWindow.$crisp.find(
          (entry) => entry[0] === "on" && entry[1] === crispEvent && typeof entry[2] === "function",
        );
        if (!registration) throw new Error(`Expected a ${crispEvent} callback.`);
        (registration[2] as () => void)();
        (registration[2] as () => void)();
      }

      return trackedWindow.oaiq.q
        .map((entry) => Array.from(entry))
        .filter((entry) => entry[0] === "measure")
        .map((entry) => ({ event: entry[1], customName: entry[3]?.custom_event_name ?? null }));
    });

    expect(events).toEqual([
      { event: "custom", customName: "shopify_listing_clicked" },
      { event: "custom", customName: "chat_opened" },
      { event: "lead_created", customName: null },
    ]);
  });
}

test("keeps ChatGPT campaign attribution during the same Peak PIM browsing session", async ({ page }) => {
  await page.route("https://bzrcdn.openai.com/sdk/oaiq.min.js", (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "" }),
  );

  await page.goto(`/shopify-multi-store-pim/?${campaignQuery}`);
  await page.goto("/bulk-edit/");

  await expectShopifyAttribution(page);
});
