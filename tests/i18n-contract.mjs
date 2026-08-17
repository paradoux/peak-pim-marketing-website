import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "parse5";

const projectRoot = resolve(import.meta.dirname, "..");
const failures = [];
const sitemapFile = resolve(projectRoot, "dist/sitemap.xml");
const localeMetadata = {
  fr: { hreflang: "fr", label: "Français" },
  de: { hreflang: "de", label: "Deutsch" },
  es: { hreflang: "es", label: "Español" },
  it: { hreflang: "it", label: "Italiano" },
  nl: { hreflang: "nl", label: "Nederlands" },
  "pt-br": { hreflang: "pt-BR", label: "Português (BR)" },
  pl: { hreflang: "pl", label: "Polski" },
  ja: { hreflang: "ja", label: "日本語" },
};
const translatedLocales = Object.keys(localeMetadata);
const allHreflangs = ["en", ...translatedLocales.map((locale) => localeMetadata[locale].hreflang)];
const translations = Object.fromEntries(translatedLocales.map((locale) => [
  locale,
  JSON.parse(readFileSync(resolve(projectRoot, `src/i18n/${locale}-translations.json`), "utf8")),
]));
const llms = readFileSync(resolve(projectRoot, "public/llms.txt"), "utf8");

function attr(node, name) {
  return node.attrs?.find((candidate) => candidate.name === name)?.value;
}

function nodes(node, predicate, matches = []) {
  if (predicate(node)) matches.push(node);
  for (const child of node.childNodes ?? []) nodes(child, predicate, matches);
  return matches;
}

function htmlFile(url) {
  const pathname = new URL(url).pathname.replace(/^\/+|\/+$/g, "");
  return resolve(projectRoot, "dist", pathname, "index.html");
}

function sitemapEntries(xml) {
  return [...xml.matchAll(/<url><loc>([^<]+)<\/loc><lastmod>[^<]+<\/lastmod>([\s\S]*?)<\/url>/g)].map((match) => ({
    url: match[1],
    alternates: Object.fromEntries([...match[2].matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)].map((alternate) => [alternate[1], alternate[2]])),
  }));
}

function visibleUntranslatedStrings(document, locale) {
  const untranslated = [];

  function walk(node, parentTag = "") {
    if (attr(node, "data-i18n-skip") !== undefined) return;
    if (node.nodeName === "#text" && !["style", "script", "noscript"].includes(parentTag)) {
      const source = node.value?.trim();
      if (source && translations[locale][source] && translations[locale][source] !== source) untranslated.push(source);
    }
    for (const attribute of node.attrs ?? []) {
      if (["alt", "aria-label", "placeholder", "title"].includes(attribute.name)
        && translations[locale][attribute.value]
        && translations[locale][attribute.value] !== attribute.value) untranslated.push(attribute.value);
    }
    for (const child of node.childNodes ?? []) walk(child, node.tagName ?? parentTag);
  }

  walk(document);
  return [...new Set(untranslated)];
}

if (!existsSync(sitemapFile)) failures.push("Missing built sitemap");

if (existsSync(sitemapFile)) {
  const entries = sitemapEntries(readFileSync(sitemapFile, "utf8"));

  for (const locale of translatedLocales) {
    const metadata = localeMetadata[locale];
    const localeEntries = entries.filter((entry) => new URL(entry.url).pathname.startsWith(`/${locale}/`));
    if (localeEntries.length !== 37) failures.push(`Expected 37 ${locale} public pages, found ${localeEntries.length}`);
    if (entries.some((entry) => entry.url === `https://peak-pim.com/${locale}/legals/privacy/`)) failures.push(`Privacy policy must remain outside the ${locale} sitemap`);

    for (const entry of localeEntries) {
      const file = htmlFile(entry.url);
      if (!existsSync(file)) {
        failures.push(`Missing ${locale} page artifact: ${file.replace(`${projectRoot}/`, "")}`);
        continue;
      }

      const html = readFileSync(file, "utf8");
      const document = parse(html);
      const links = nodes(document, (node) => node.tagName === "link");
      const alternateLinks = Object.fromEntries(links.filter((node) => attr(node, "rel") === "alternate").map((node) => [attr(node, "hreflang"), attr(node, "href")]));
      const canonical = links.find((node) => attr(node, "rel") === "canonical");
      const title = nodes(document, (node) => node.tagName === "title")[0];
      const description = nodes(document, (node) => node.tagName === "meta" && attr(node, "name") === "description")[0];
      const h1s = nodes(document, (node) => node.tagName === "h1");
      const schemas = nodes(document, (node) => node.tagName === "script" && attr(node, "type") === "application/ld+json")
        .map((node) => node.childNodes?.find((child) => child.nodeName === "#text")?.value)
        .filter(Boolean)
        .map((value) => JSON.parse(value));
      const languageSchemas = schemas.filter((schema) => ["WebPage", "CollectionPage", "Article", "SoftwareApplication", "FAQPage"].includes(schema["@type"]));
      const isGlobalSchema = (schema) => ["Organization", "WebSite"].includes(schema["@type"])
        || (schema["@type"] === "SoftwareApplication" && (schema.url === "https://peak-pim.com/" || String(schema["@id"] ?? "").includes("#software")));
      const pageSchemas = schemas.filter((schema) => ["WebPage", "CollectionPage", "Article"].includes(schema["@type"]) || (schema["@type"] === "SoftwareApplication" && !isGlobalSchema(schema)));
      const globalSchemas = schemas.filter(isGlobalSchema);
      const englishUrl = entry.alternates.en;

      if (attr(nodes(document, (node) => node.tagName === "html")[0], "lang") !== metadata.hreflang) failures.push(`${entry.url} has the wrong document language`);
      if (attr(canonical, "href") !== entry.url) failures.push(`${entry.url} has a non-self-referencing canonical`);
      for (const hreflang of allHreflangs) {
        if (!entry.alternates[hreflang] || alternateLinks[hreflang] !== entry.alternates[hreflang]) failures.push(`${entry.url} is missing its ${hreflang} hreflang`);
      }
      if (alternateLinks[metadata.hreflang] !== entry.url || entry.alternates[metadata.hreflang] !== entry.url) failures.push(`${entry.url} is missing its self-referencing hreflang`);
      if (alternateLinks["x-default"] !== englishUrl || entry.alternates["x-default"] !== englishUrl) failures.push(`${entry.url} has the wrong x-default hreflang`);
      if (!title?.childNodes?.some((node) => node.value?.trim())) failures.push(`${entry.url} is missing a translated title`);
      if (!attr(description, "content")) failures.push(`${entry.url} is missing a translated meta description`);
      if (h1s.length !== 1) failures.push(`${entry.url} must contain exactly one H1 (found ${h1s.length})`);
      if (!html.includes("site-footer-language__trigger")) failures.push(`${entry.url} is missing the footer language selector`);
      if (!html.includes(`href="${new URL(englishUrl).pathname}" hreflang="en" lang="en"`)) failures.push(`${entry.url} footer selector does not link to its English equivalent`);
      for (const { label } of Object.values(localeMetadata)) if (!html.includes(`>${label}<`)) failures.push(`${entry.url} footer selector is missing ${label}`);
      if (html.includes("data-lead-modal-root")) failures.push(`${entry.url} includes the English-only lead modal`);
      if (languageSchemas.some((schema) => schema.inLanguage !== metadata.hreflang)) failures.push(`${entry.url} has structured data without inLanguage=${metadata.hreflang}`);
      if (pageSchemas.some((schema) => schema.url && schema.url !== entry.url)) failures.push(`${entry.url} has structured data with a non-canonical page URL`);
      if (globalSchemas.some((schema) => schema.url && schema.url !== "https://peak-pim.com/")) failures.push(`${entry.url} localizes a global entity URL`);

      const untranslated = visibleUntranslatedStrings(document, locale);
      if (untranslated.length) failures.push(`${entry.url} contains untranslated visible strings: ${untranslated.slice(0, 3).join(" | ")}`);
      if (!llms.includes(entry.url)) failures.push(`llms.txt is missing ${entry.url}`);

      if (englishUrl) {
        const englishFile = htmlFile(englishUrl);
        if (!existsSync(englishFile)) failures.push(`Missing English equivalent for ${entry.url}`);
        else if (!readFileSync(englishFile, "utf8").includes(`href="${new URL(entry.url).pathname}" hreflang="${metadata.hreflang}" lang="${metadata.hreflang}"`)) {
          failures.push(`${englishUrl} footer selector does not link to its ${locale} equivalent`);
        }
      }
    }
  }

  const privacyEntry = entries.find((entry) => entry.url === "https://peak-pim.com/legals/privacy/");
  if (!privacyEntry) failures.push("Sitemap is missing the English privacy policy");
  else if (Object.keys(privacyEntry.alternates).length) failures.push("English-only privacy policy must not emit hreflang alternates");
}

if (!existsSync(resolve(projectRoot, "public/assets/og/fr-shopify-pim-translations.png"))) failures.push("Missing localized French Open Graph image");

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log("Internationalization contract passed for 296 localized public pages across 8 translated locales.");
