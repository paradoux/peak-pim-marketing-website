import { parse, serialize } from "parse5";
import { defaultLocale, findLocalizedRoute, localeMetadata, publicPath, type Locale } from "./config";
import { translationCaches } from "./translation-caches";

type HtmlNode = {
  nodeName?: string;
  tagName?: string;
  value?: string;
  attrs?: Array<{ name: string; value: string }>;
  childNodes?: HtmlNode[];
};

const ignoredTextParents = new Set(["style", "script", "noscript"]);
const translatableAttributes = new Set(["alt", "aria-label", "placeholder", "title"]);
const nonTranslatableSchemaKeys = new Set([
  "@context", "@type", "@id", "price", "priceCurrency", "availability",
  "applicationCategory", "applicationSubCategory", "operatingSystem",
]);

function attribute(node: HtmlNode, name: string) {
  return node.attrs?.find((candidate) => candidate.name === name)?.value;
}

function setAttribute(node: HtmlNode, name: string, value: string) {
  const existing = node.attrs?.find((candidate) => candidate.name === name);
  if (existing) existing.value = value;
  else (node.attrs ??= []).push({ name, value });
}

function translateText(value: string, translations: Record<string, string>) {
  const match = value.match(/^(\s*)([\s\S]*?)(\s*)$/u);
  if (!match || !match[2]) return value;
  const translated = translations[match[2]];
  return translated ? `${match[1]}${translated}${match[3]}` : value;
}

function localizeUrl(value: string, locale: Locale) {
  const absolute = value.startsWith("https://peak-pim.com");
  const parsed = absolute ? new URL(value) : undefined;
  const pathWithSuffix = parsed ? `${parsed.pathname}${parsed.search}${parsed.hash}` : value;
  if (!pathWithSuffix.startsWith("/") || pathWithSuffix.startsWith("//")) return value;

  const match = pathWithSuffix.match(/^([^?#]*)([\s\S]*)$/u);
  if (!match) return value;
  const matchedRoute = findLocalizedRoute(match[1]);
  if (!matchedRoute) return value;
  const localized = `${publicPath(matchedRoute.paths[locale])}${match[2]}`;
  return absolute ? `https://peak-pim.com${localized}` : localized;
}

function schemaUrl(value: string, locale: Locale) {
  const localized = localizeUrl(value, locale);
  return localized.startsWith("/") ? `https://peak-pim.com${localized}` : localized;
}

function localizeSchemaValue(
  value: unknown,
  locale: Locale,
  translations: Record<string, string>,
  key = "",
  parentType = "",
  parentIsGlobal = false,
): unknown {
  if (Array.isArray(value)) return value.map((entry) => localizeSchemaValue(entry, locale, translations, key, parentType, parentIsGlobal));
  if (value && typeof value === "object") {
    const schemaNode = value as Record<string, unknown>;
    const schemaType = String(schemaNode["@type"] ?? parentType);
    const isGlobal = ["Organization", "WebSite"].includes(schemaType)
      || (schemaType === "SoftwareApplication" && (schemaNode.url === "https://peak-pim.com/" || String(schemaNode["@id"] ?? "").includes("#software")));
    return Object.fromEntries(Object.entries(value).map(([childKey, childValue]) => [
      childKey,
      localizeSchemaValue(childValue, locale, translations, childKey, schemaType, isGlobal),
    ]));
  }
  if (typeof value !== "string") return value;
  if (key === "inLanguage") return localeMetadata[locale].hreflang;
  if (key === "@context") return value;
  if (key === "@id" && (parentIsGlobal || value.startsWith("https://peak-pim.com/#"))) return value;
  if (key === "url" && parentIsGlobal) return value;

  const localizedUrl = schemaUrl(value, locale);
  if (localizedUrl !== value || nonTranslatableSchemaKeys.has(key)) return localizedUrl;
  return translations[value] ?? value;
}

function localizeSchema(value: unknown, locale: Locale, translations: Record<string, string>) {
  const localized = localizeSchemaValue(value, locale, translations);
  if (!localized || Array.isArray(localized) || typeof localized !== "object") return localized;

  const schema = localized as Record<string, unknown>;
  if (["WebPage", "CollectionPage", "Article", "SoftwareApplication", "FAQPage"].includes(String(schema["@type"]))) {
    schema.inLanguage = localeMetadata[locale].hreflang;
  }
  return schema;
}

function localizeNode(node: HtmlNode, locale: Locale, translations: Record<string, string>, parentTag = "") {
  if (attribute(node, "data-i18n-skip") !== undefined) return;

  if (node.nodeName === "#text" && typeof node.value === "string" && !ignoredTextParents.has(parentTag)) {
    node.value = translateText(node.value, translations);
  }

  if (node.tagName === "html") setAttribute(node, "lang", localeMetadata[locale].hreflang);

  for (const attr of node.attrs ?? []) {
    if (attr.name === "href" && node.tagName === "a" && attribute(node, "hreflang") === undefined) attr.value = localizeUrl(attr.value, locale);
    if (translatableAttributes.has(attr.name)) attr.value = translations[attr.value] ?? attr.value;
  }

  if (node.tagName === "meta") {
    const name = attribute(node, "name") ?? "";
    const property = attribute(node, "property") ?? "";
    const content = attribute(node, "content");
    if (content && ["description", "twitter:title", "twitter:description"].includes(name)) {
      setAttribute(node, "content", translations[content] ?? content);
    }
    if (content && ["og:title", "og:description", "og:image:alt", "og:url"].includes(property)) {
      setAttribute(node, "content", property === "og:url" ? localizeUrl(content, locale) : (translations[content] ?? content));
    }
    if (property === "og:locale") setAttribute(node, "content", localeMetadata[locale].ogLocale);
  }

  if (node.tagName === "script" && attribute(node, "type") === "application/ld+json") {
    const textNode = node.childNodes?.find((child) => child.nodeName === "#text");
    if (textNode?.value) {
      try {
        textNode.value = JSON.stringify(localizeSchema(JSON.parse(textNode.value), locale, translations));
      } catch {
        // Keep malformed third-party structured data untouched.
      }
    }
  }

  for (const child of node.childNodes ?? []) localizeNode(child, locale, translations, node.tagName ?? parentTag);
}

export function localizeHtml(html: string, locale: Locale) {
  if (locale === defaultLocale) return html;
  const document = parse(html) as HtmlNode;
  localizeNode(document, locale, translationCaches[locale]);
  return serialize(document as never);
}
