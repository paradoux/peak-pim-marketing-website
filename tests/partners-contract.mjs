import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "parse5";

const output = resolve("dist-partners");
const files = readdirSync(output, { recursive: true }).filter((file) => file.endsWith(".html"));
assert(files.includes("index.html") && files.includes("axome/index.html") && files.includes("404.html"));
assert(!existsSync(resolve(output, "assets/ads")), "Do not publish unfinished advertising assets");
assert(!existsSync(resolve(output, "sitemap.xml")), "Do not expose partner pages in a sitemap");
assert(!existsSync(resolve(output, "_redirects")), "Do not inherit marketing redirects");
assert(!existsSync(resolve(output, "partners/index.html")), "Do not publish the unfinished partners page");
assert.match(readFileSync(resolve(output, "_headers"), "utf8"), /X-Robots-Tag: noindex, nofollow/);

for (const file of files) {
  const html = readFileSync(resolve(output, file), "utf8");
  const nodes = [];
  const collect = (node) => { if (node.tagName) nodes.push(node); node.childNodes?.forEach(collect); };
  collect(parse(html));
  const attr = (node, name) => node.attrs.find((item) => item.name === name)?.value;
  assert.equal(nodes.filter((node) => node.tagName === "h1").length, 1, file);
  if (file !== "404.html") {
    for (const id of ["hero", "problem", "solution", "implementation", "partnership", "contact"]) assert(nodes.some(node => attr(node, "id") === id), `Missing ${id}`);
    const header = nodes.find(node => (attr(node, "class") ?? "").includes("peak-one-pager-header"));
    assert(header, "Missing one-pager header");
    const checkHeader = node => {
      if (node.tagName === "a") assert(attr(node, "href").startsWith("#"), "Header must only link to sections");
      node.childNodes?.forEach(checkHeader);
    };
    checkHeader(header);
    assert(!nodes.some(node => attr(node, "class") === "site-footer"), "Do not render marketing footer");
    assert(html.includes("percentage depends on the deal"));
    assert.match(html, /<!--email_off--><a href="mailto:theau@peak-pim\.com"[^>]*>theau@peak-pim\.com<\/a><!--\/email_off-->/, "Keep the contact email usable without Cloudflare's decode script");
    for (const href of ["mailto:theau@peak-pim.com", "https://www.linkedin.com/in/theau/", "https://peak-pim.com/"]) assert(nodes.some(node => node.tagName === "a" && attr(node, "href") === href), `Missing contact ${href}`);
  }
  const canonical = nodes.find((node) => node.tagName === "link" && attr(node, "rel") === "canonical");
  const path = file === "index.html" ? "/" : file === "404.html" ? "/404/" : `/${file.replace(/\/index\.html$/, "")}/`;
  assert.equal(attr(canonical, "href"), `https://partners.peak-pim.com${path}`);
  assert(nodes.some((node) => node.tagName === "meta" && attr(node, "name") === "robots" && attr(node, "content") === "noindex,nofollow"));
  assert(!nodes.some((node) => attr(node, "hreflang")), "Partner pages have no published locale alternatives");
  assert(!html.includes('data-auto-open="true"'), "Partner brief must not auto-open the booking modal");
  for (const node of nodes) {
    if (node.tagName === "a") {
      const href = attr(node, "href") ?? "";
      assert(!/^\/(?!\/)/.test(href) || href === "/", `Broken subdomain navigation in ${file}: ${href}`);
      if (href.startsWith("#") && href !== "#") assert(nodes.some((target) => attr(target, "id") === href.slice(1)), `Missing anchor: ${href}`);
      if (attr(node, "data-demo-booking") !== undefined) assert.equal(href, "https://peak-pim.com/book-a-demo/");
    }
    for (const name of ["src", "href"]) {
      const value = attr(node, name);
      if (value?.startsWith("/assets/") || value?.startsWith("/mirror/") || value?.startsWith("/_astro/")) {
        assert(existsSync(resolve(output, value.slice(1))), `Missing asset: ${value}`);
      }
    }
  }
}
assert(!readFileSync(resolve(output, "index.html"), "utf8").includes("/axome"), "Do not list personalized briefings publicly");
console.log(`Partner contract passed for ${files.length} pages: canonical, noindex, navigation, booking, assets, and isolated output.`);
