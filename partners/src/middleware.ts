import { defineMiddleware } from "astro:middleware";
import { parse, serialize, type DefaultTreeAdapterMap } from "parse5";

// Shared navigation belongs to the marketing site. Keep the hub logo and
// in-page anchors local, including the demo modal's progressively enhanced link.
export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  if (!response.headers.get("content-type")?.includes("text/html")) return response;
  const document = parse(await response.text());
  function visit(node: DefaultTreeAdapterMap["node"]) {
    if ("tagName" in node && node.tagName === "a") {
      const href = node.attrs.find((attribute) => attribute.name === "href");
      if (href && /^\/(?!\/)/.test(href.value) && href.value !== "/") {
        href.value = `https://peak-pim.com${href.value}`;
      }
    }
    if ("childNodes" in node) node.childNodes.forEach(visit);
  }
  visit(document);
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(serialize(document), { status: response.status, headers });
});
