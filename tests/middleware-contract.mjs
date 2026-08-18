import assert from "node:assert/strict";

const storedResponses = new Map();
globalThis.caches = {
  default: {
    async match(request) {
      return storedResponses.get(request.url)?.clone();
    },
    async put(request, response) {
      storedResponses.set(request.url, response.clone());
    },
  },
};

const { onRequest } = await import("../functions/_middleware.ts");

function pageContext(url, { deployment = "deployment-a", body = "home", production = true } = {}) {
  let nextCalls = 0;
  const pending = [];
  const requestUrl = production ? url : url.replace("peak-pim.com", "preview.pages.dev");

  return {
    context: {
      request: new Request(requestUrl),
      env: { CF_PAGES_COMMIT_SHA: deployment },
      next: async () => {
        nextCalls += 1;
        return new Response(body, { headers: { "content-type": "text/html; charset=utf-8" } });
      },
      waitUntil(promise) {
        pending.push(promise);
      },
    },
    nextCalls: () => nextCalls,
    settle: () => Promise.all(pending),
  };
}

const first = pageContext("https://peak-pim.com/");
const firstResponse = await onRequest(first.context);
await first.settle();
assert.equal(await firstResponse.text(), "home");
assert.equal(first.nextCalls(), 1);
assert.equal(firstResponse.headers.get("cache-control"), "public, max-age=0, must-revalidate");
assert.equal(firstResponse.headers.has("cache-tag"), false);

const cached = pageContext("https://peak-pim.com/", { body: "should not be fetched" });
const cachedResponse = await onRequest(cached.context);
assert.equal(await cachedResponse.text(), "home");
assert.equal(cached.nextCalls(), 0);

const newDeployment = pageContext("https://peak-pim.com/", { deployment: "deployment-b", body: "new home" });
const newDeploymentResponse = await onRequest(newDeployment.context);
await newDeployment.settle();
assert.equal(await newDeploymentResponse.text(), "new home");
assert.equal(newDeployment.nextCalls(), 1);

const preview = pageContext("https://peak-pim.com/", { production: false, body: "preview" });
const previewResponse = await onRequest(preview.context);
await preview.settle();
assert.equal(await previewResponse.text(), "preview");
assert.equal(preview.nextCalls(), 1);
assert.equal(previewResponse.headers.get("x-robots-tag"), "noindex, nofollow, noarchive, nosnippet, noimageindex");

const cachedPreview = pageContext("https://peak-pim.com/", { production: false, body: "should not be fetched" });
const cachedPreviewResponse = await onRequest(cachedPreview.context);
assert.equal(await cachedPreviewResponse.text(), "preview");
assert.equal(cachedPreview.nextCalls(), 0);
assert.equal(cachedPreviewResponse.headers.get("x-robots-tag"), "noindex, nofollow, noarchive, nosnippet, noimageindex");

const asset = pageContext("https://peak-pim.com/mirror/local-fonts.css", { body: "font styles" });
const assetResponse = await onRequest(asset.context);
assert.equal(await assetResponse.text(), "font styles");
assert.equal(asset.nextCalls(), 1);
assert.equal(assetResponse.headers.has("cache-tag"), false);

const redirect = pageContext("https://www.peak-pim.com/path?source=test");
const redirectResponse = await onRequest(redirect.context);
assert.equal(redirectResponse.status, 301);
assert.equal(redirectResponse.headers.get("location"), "https://peak-pim.com/path?source=test");
assert.equal(redirect.nextCalls(), 0);

console.log("Middleware cache contract passed.");
