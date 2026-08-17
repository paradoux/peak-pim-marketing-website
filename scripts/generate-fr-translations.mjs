import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "parse5";

const projectRoot = resolve(import.meta.dirname, "..");
const sitemapPath = resolve(projectRoot, "dist/sitemap.xml");
const dryRun = process.argv.includes("--dry-run");
const supportedLocales = ["fr", "de", "es", "it", "nl", "pt-br", "pl", "ja"];
const localeArgumentIndex = process.argv.indexOf("--locale");
const requestedLocales = localeArgumentIndex === -1 ? supportedLocales : [process.argv[localeArgumentIndex + 1]];
const googleLocale = { fr: "fr", de: "de", es: "es", it: "it", nl: "nl", "pt-br": "pt", pl: "pl", ja: "ja" };

if (requestedLocales.some((locale) => !supportedLocales.includes(locale))) {
  throw new Error(`Unsupported locale. Use one of: ${supportedLocales.join(", ")}`);
}
const translatableAttributes = new Set(["alt", "aria-label", "placeholder", "title"]);
const ignoredTextParents = new Set(["style", "script", "noscript"]);
const ignoredSchemaKeys = new Set([
  "@context", "@type", "@id", "url", "price", "priceCurrency", "availability",
  "applicationCategory", "applicationSubCategory", "operatingSystem", "inLanguage",
]);
const protectedTerms = [
  "Shopify Markets", "Metafields Guru", "Google Sheets", "Peak PIM", "Maéli Paris",
  "Carré Coco", "Shopify", "Matrixify", "ChatGPT", "Anthropic", "OpenAI", "SyncBase",
  "Airtable", "Akeneo", "Plytix", "Salsify", "Catsy", "Quable", "Claude", "Drops",
  "Drop", "JavaScript", "Webflow", "Core", "Elite", "Enterprise", "MCP", "API", "CSV",
  "Excel", "JSON", "SKUs", "SKU", "B2B", "B2C", "PIM",
  "Peak", "Tupperware", "Artefact", "Du Bruit dans la Cuisine", "Lafaurie",
  "Gully Labs", "waterdrop", "Naked Wolfe", "Lillicoco", "What Matters",
].sort((left, right) => right.length - left.length);

function attr(node, name) {
  return node.attrs?.find((candidate) => candidate.name === name)?.value;
}

function isTranslatable(value) {
  const text = value.trim();
  return text.length > 1
    && /[A-Za-z]/u.test(text)
    && !/^(?:https?:\/\/|mailto:|tel:|#[\w-]+$)/u.test(text)
    && !/^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/u.test(text)
    && !/^[-\w./]+\.(?:png|jpe?g|webp|svg|gif|woff2?)$/iu.test(text);
}

function addText(strings, value) {
  const text = value.trim();
  if (isTranslatable(text)) strings.add(text);
}

function collectSchemaStrings(value, strings, key = "") {
  if (Array.isArray(value)) {
    for (const entry of value) collectSchemaStrings(entry, strings, key);
    return;
  }
  if (value && typeof value === "object") {
    for (const [childKey, childValue] of Object.entries(value)) collectSchemaStrings(childValue, strings, childKey);
    return;
  }
  if (typeof value === "string" && !ignoredSchemaKeys.has(key)) addText(strings, value);
}

function collectNodeStrings(node, strings, parentTag = "") {
  if (attr(node, "data-i18n-skip") !== undefined) return;

  if (node.nodeName === "#text" && typeof node.value === "string" && !ignoredTextParents.has(parentTag)) {
    addText(strings, node.value);
  }

  for (const attribute of node.attrs ?? []) {
    if (translatableAttributes.has(attribute.name)) addText(strings, attribute.value);
  }

  if (node.tagName === "meta") {
    const name = attr(node, "name") ?? "";
    const property = attr(node, "property") ?? "";
    const content = attr(node, "content") ?? "";
    if (["description", "twitter:title", "twitter:description"].includes(name)) addText(strings, content);
    if (["og:title", "og:description", "og:image:alt"].includes(property)) addText(strings, content);
  }

  if (node.tagName === "script" && attr(node, "type") === "application/ld+json") {
    const value = node.childNodes?.find((child) => child.nodeName === "#text")?.value;
    if (value) {
      try {
        collectSchemaStrings(JSON.parse(value), strings);
      } catch {
        // Ignore malformed third-party structured data.
      }
    }
  }

  for (const child of node.childNodes ?? []) collectNodeStrings(child, strings, node.tagName ?? parentTag);
}

function distFileForUrl(url) {
  const pathname = new URL(url).pathname.replace(/^\/+|\/+$/g, "");
  return resolve(projectRoot, "dist", pathname, "index.html");
}

function protectTerms(text) {
  const replacements = [];
  let protectedText = text;

  for (const term of protectedTerms) {
    protectedText = protectedText.replaceAll(term, () => {
      const token = `ZXQTERM${replacements.length}ZXQ`;
      replacements.push(term);
      return token;
    });
  }

  return { protectedText, replacements };
}

function restoreTerms(text, replacements) {
  return replacements.reduce((value, term, index) => value.replaceAll(`ZXQTERM${index}ZXQ`, term), text);
}

function applyFrenchGlossary(text, source = "") {
  const overrides = {
    "Book a demo": "Réserver une démo",
    "Bulk Edit": "Modification en bloc",
    "Bulk edit": "Modification en bloc",
    "Contact": "Contact",
    "English": "English",
    "Get Peak PIM": "Installer Peak PIM",
    "Handle": "Identifiant d’URL",
    "Handles": "Identifiants d’URL",
    "Health Center": "Centre de contrôle",
    "History": "Historique",
    "Learn more": "En savoir plus",
    "Live demo": "Démo en ligne",
    "Merchants": "Marchands",
    "Metaobjects": "Métaobjets",
    "PIM setup shouldn't be a project": "La configuration d’un PIM ne devrait pas être un projet",
    "Plan the change and its rollback together": "Planifiez la modification et sa restauration ensemble",
    "Plug into a workspace you already manage.": "Connectez-vous à un espace de travail que vous gérez déjà.",
    "Peak": "Peak",
    "Scores": "Scores",
    "See comparison": "Comparer",
    "See how it works": "Voir comment ça marche",
    "See pricing": "Voir les tarifs",
    "See the comparison": "Voir la comparaison",
    "See use case": "Voir le cas client",
    "Talk to us": "Nous contacter",
    "SKUs managed": "SKU gérés",
    "Standard": "Standard",
    "Stores synced": "Boutiques synchronisées",
    "Try for free": "Essayer gratuitement",
    "Try Peak PIM": "Essayer gratuitement",
    "Veste Ridge": "Veste Ridge",
    "View API documentation": "Voir la documentation API",
  };
  if (overrides[source]) return overrides[source];

  let normalized = text
    .replace(/méta[- ]?champs/giu, "champs méta")
    .replace(/méta[- ]?champ/giu, "champ méta")
    .replace(/métadonnées personnalisées/giu, "champs méta")
    .replace(/méta[- ]?objets/giu, "métaobjets")
    .replace(/méta[- ]?objet/giu, "métaobjet")
    .replace(/Questions fréquemment posées/gu, "Questions fréquentes")
    .replace(/modifications groupées/giu, "modifications en bloc")
    .replace(/modification groupée/giu, "modification en bloc")
    .replace(/modifications en masse/giu, "modifications en bloc")
    .replace(/modification en masse/giu, "modification en bloc")
    .replace(/édition en masse/giu, "modification en bloc")
    .replace(/éditez en masse/giu, "modifiez en bloc")
    .replace(/modifiez en masse/giu, "modifiez en bloc")
    .replace(/multi-magasins/giu, "multiboutique")
    .replace(/magasins/giu, "boutiques")
    .replace(/magasin/giu, "boutique")
    .replace(/vitrines/giu, "boutiques en ligne")
    .replace(/vitrine/giu, "boutique en ligne")
    .replace(/commerçants/giu, "marchands")
    .replace(/commerçant/giu, "marchand")
    .replace(/marchandisage/giu, "merchandising")
    .replace(/Peak PIM bat ([^.]+)/gu, "Peak PIM surpasse $1")
    .replace(/premières marques Shopify/giu, "marques centrées sur Shopify")
    .replace(/marques Shopify-first/giu, "marques centrées sur Shopify")
    .replace(/Shopify-Native/gu, "natif Shopify")
    .replace(/Shopify-native/gu, "natif Shopify")
    .replace(/administration Shopify/gu, "interface administrateur Shopify")
    .replace(/administrateur Shopify/gu, "interface administrateur Shopify");

  if (/\bhandles?\b/iu.test(source)) {
    normalized = normalized
      .replace(/poignées/giu, "identifiants d’URL")
      .replace(/poignée/giu, "identifiant d’URL")
      .replace(/descripteurs/giu, "identifiants d’URL")
      .replace(/descripteur/giu, "identifiant d’URL")
      .replace(/\bhandles\b/giu, "identifiants d’URL")
      .replace(/\bhandle\b/giu, "identifiant d’URL");
  }

  if (source.includes("Health Center")) normalized = normalized.replaceAll("Health Center", "Centre de contrôle");
  if (source.includes("Global Search")) normalized = normalized.replaceAll("Global Search", "Recherche globale");
  if (/\bBulk Edit\b/u.test(source)) normalized = normalized.replaceAll("Bulk Edit", "Modification en bloc");
  return normalized
}

const terminologyOverrides = {
  de: {
    "Bulk edit": "Massenbearbeitung", "Bulk Edit": "Massenbearbeitung", "Handle": "URL-Handle", "Handles": "URL-Handles",
    "Merchants": "Händler", "Metafields": "Metafelder", "Metaobjects": "Metaobjekte", "Shopify admin": "Shopify-Adminbereich",
    "Stores": "Shops", "Try for free": "Kostenlos testen", "Book a demo": "Demo buchen",
    "One place for all your Shopify products": "Alle Shopify-Produkte an einem Ort",
    "Peak PIM | Product Management for Shopify Merchants": "Peak PIM | Produktmanagement für Shopify-Händler",
  },
  es: {
    "Bulk edit": "Edición masiva", "Bulk Edit": "Edición masiva", "Handle": "Identificador de URL", "Handles": "Identificadores de URL",
    "Merchants": "Comerciantes", "Metafields": "Metacampos", "Metaobjects": "Metaobjetos", "Shopify admin": "Panel de control de Shopify",
    "Stores": "Tiendas", "Try for free": "Probar gratis", "Book a demo": "Reservar una demo",
    "One place for all your Shopify products": "Todos tus productos de Shopify en un solo lugar",
    "Peak PIM | Product Management for Shopify Merchants": "Peak PIM | Gestión de productos para comerciantes de Shopify",
  },
  it: {
    "Bulk edit": "Modifica in blocco", "Bulk Edit": "Modifica in blocco", "Handle": "Handle URL", "Handles": "Handle URL",
    "Merchants": "Merchant", "Metafields": "Metafield", "Metaobjects": "Metaobject", "Shopify admin": "Pannello di controllo Shopify",
    "Stores": "Negozi", "Try for free": "Prova gratis", "Book a demo": "Prenota una demo",
    "One place for all your Shopify products": "Tutti i tuoi prodotti Shopify in un unico posto",
    "Peak PIM | Product Management for Shopify Merchants": "Peak PIM | Gestione dei prodotti per i merchant Shopify",
    "Tag": "Tag", "metafield": "metafield",
  },
  nl: {
    "Bulk edit": "Bulkbewerking", "Bulk Edit": "Bulkbewerking", "Handle": "URL-handle", "Handles": "URL-handles",
    "Merchants": "Merchants", "Metafields": "Metavelden", "Metaobjects": "Metaobjecten", "Shopify admin": "Shopify-beheercentrum",
    "Stores": "Winkels", "Try for free": "Gratis proberen", "Book a demo": "Demo boeken",
    "One place for all your Shopify products": "Al je Shopify-producten op één plek",
    "Peak PIM | Product Management for Shopify Merchants": "Peak PIM | Productbeheer voor Shopify-merchants",
  },
  "pt-br": {
    "Bulk edit": "Edição em massa", "Bulk Edit": "Edição em massa", "Handle": "Identificador de URL", "Handles": "Identificadores de URL",
    "Merchants": "Lojistas", "Metafields": "Metacampos", "Metaobjects": "Metaobjetos", "Shopify admin": "Admin da Shopify",
    "Stores": "Lojas", "Try for free": "Teste grátis", "Book a demo": "Agendar uma demonstração",
    "One place for all your Shopify products": "Todos os seus produtos Shopify em um só lugar",
    "Peak PIM | Product Management for Shopify Merchants": "Peak PIM | Gestão de produtos para lojistas da Shopify",
  },
  pl: {
    "Bulk edit": "Edycja zbiorcza", "Bulk Edit": "Edycja zbiorcza", "Handle": "Uchwyt adresu URL", "Handles": "Uchwyty adresów URL",
    "Merchants": "Sprzedawcy", "Metafields": "Metapola", "Metaobjects": "Metaobiekty", "Shopify admin": "Panel administracyjny Shopify",
    "Stores": "Sklepy", "Try for free": "Wypróbuj bezpłatnie", "Book a demo": "Umów prezentację",
    "One place for all your Shopify products": "Wszystkie produkty Shopify w jednym miejscu",
    "Peak PIM | Product Management for Shopify Merchants": "Peak PIM | Zarządzanie produktami dla sprzedawców Shopify",
    "Import": "Import",
  },
  ja: {
    "Bulk edit": "一括編集", "Bulk Edit": "一括編集", "Handle": "URLハンドル", "Handles": "URLハンドル",
    "Merchants": "マーチャント", "Metafields": "メタフィールド", "Metaobjects": "メタオブジェクト", "Shopify admin": "Shopify管理画面",
    "Stores": "ストア", "Try for free": "無料で試す", "Book a demo": "デモを予約",
    "One place for all your Shopify products": "すべてのShopify商品を一元管理",
    "Peak PIM | Product Management for Shopify Merchants": "Peak PIM | Shopifyマーチャント向け商品管理",
  },
};

function applyShopifyGlossary(locale, text, source = "") {
  if (locale === "fr") return applyFrenchGlossary(text, source);
  const override = terminologyOverrides[locale]?.[source];
  if (override) return override;

  const normalizers = {
    de: (value) => value.replace(/Meta-?Objekte/giu, "Metaobjekte").replace(/Meta-?Felder/giu, "Metafelder"),
    es: (value) => value.replace(/meta campos/giu, "metacampos").replace(/meta objetos/giu, "metaobjetos"),
    it: (value) => value.replace(/meta campi/giu, "metafield").replace(/meta oggetti/giu, "metaobject"),
    nl: (value) => value.replace(/meta velden/giu, "metavelden").replace(/meta objecten/giu, "metaobjecten"),
    "pt-br": (value) => value.replace(/meta campos/giu, "metacampos").replace(/meta objetos/giu, "metaobjetos"),
    pl: (value) => value.replace(/meta pola/giu, "metapola").replace(/meta obiekty/giu, "metaobiekty"),
    ja: (value) => value.replace(/メタフィールド/gu, "メタフィールド").replace(/メタオブジェクト/gu, "メタオブジェクト"),
  };
  let normalized = normalizers[locale]?.(text) ?? text;
  if (locale === "pt-br" && /merchants?/iu.test(source)) normalized = normalized.replace(/comerciantes|vendedores/giu, "lojistas");
  if (locale === "it" && /merchants?/iu.test(source)) normalized = normalized.replace(/commercianti/giu, "merchant");
  if (locale === "nl" && /merchants?/iu.test(source)) normalized = normalized.replace(/verkopers/giu, "merchants");
  if (locale === "ja") {
    if (/merchants?/iu.test(source)) normalized = normalized.replace(/加盟店|販売者/gu, "マーチャント");
    if (/products?|product catalog/iu.test(source)) normalized = normalized.replace(/製品/gu, "商品");
    if (/stores?|storefront/iu.test(source)) normalized = normalized.replace(/店舗/gu, "ストア");
  }
  return normalized;
}

async function requestTranslation(text, locale) {
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "en");
  url.searchParams.set("tl", googleLocale[locale]);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text);

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const response = await fetch(url);
    if (response.ok) {
      const payload = await response.json();
      return payload[0].map((part) => part[0]).join("");
    }
    if (attempt === 4) throw new Error(`Translation failed (${response.status}) for: ${text.slice(0, 120)}`);
    await new Promise((resolvePromise) => setTimeout(resolvePromise, attempt * 750));
  }
}

async function translateBatch(texts, locale) {
  const protectedEntries = texts.map(protectTerms);
  const separator = "\nZXQSEPZXQ\n";
  const translatedBatch = await requestTranslation(protectedEntries.map((entry) => entry.protectedText).join(separator), locale);
  const parts = translatedBatch.split(/\s*ZXQSEPZXQ\s*/u);

  if (parts.length !== texts.length) {
    return Promise.all(protectedEntries.map(async (entry, index) => applyShopifyGlossary(locale, restoreTerms(await requestTranslation(entry.protectedText, locale), entry.replacements), texts[index])));
  }

  return parts.map((part, index) => applyShopifyGlossary(locale, restoreTerms(part, protectedEntries[index].replacements), texts[index]));
}

const sitemap = readFileSync(sitemapPath, "utf8");
const englishUrls = [...sitemap.matchAll(/<loc>(https:\/\/peak-pim\.com\/[^<]*)<\/loc>/g)]
  .map((match) => match[1])
  .filter((url) => !/^\/(?:fr|de|es|it|nl|pt-br|pl|ja)(?:\/|$)/u.test(new URL(url).pathname) && new URL(url).pathname !== "/legals/privacy/");
const strings = new Set();

for (const url of englishUrls) {
  collectNodeStrings(parse(readFileSync(distFileForUrl(url), "utf8")), strings);
}

async function updateLocale(locale) {
  const translationsPath = resolve(projectRoot, `src/i18n/${locale}-translations.json`);
  const rawExisting = JSON.parse(readFileSync(translationsPath, "utf8"));
  const existing = Object.fromEntries(Object.entries(rawExisting).map(([source, translation]) => [source, applyShopifyGlossary(locale, translation, source)]));
  const normalizedExisting = JSON.stringify(existing) !== JSON.stringify(rawExisting);
  const missing = [...strings].filter((value) => !existing[value]).sort((left, right) => left.localeCompare(right));
  console.log(`${locale} translation cache: ${strings.size} strings found, ${missing.length} missing.`);

  if (dryRun) return;
  if (missing.length === 0) {
    if (normalizedExisting) {
      const ordered = Object.fromEntries(Object.entries(existing).sort(([left], [right]) => left.localeCompare(right)));
      writeFileSync(translationsPath, `${JSON.stringify(ordered, null, 2)}\n`);
      console.log(`Normalized the existing ${locale} translation cache.`);
    }
    return;
  }

  const translated = { ...existing };
  const batches = [];
  for (const source of missing) {
    const current = batches.at(-1);
    if (!current || current.length >= 24 || current.reduce((total, value) => total + value.length, 0) + source.length > 3200) {
      batches.push([source]);
    } else {
      current.push(source);
    }
  }

  const concurrency = 6;
  let cursor = 0;
  let completed = 0;
  async function worker() {
    while (cursor < batches.length) {
      const index = cursor;
      cursor += 1;
      const sources = batches[index];
      const results = await translateBatch(sources, locale);
      sources.forEach((source, sourceIndex) => { translated[source] = results[sourceIndex]; });
      completed += sources.length;
      if (completed % 250 < sources.length || completed === missing.length) console.log(`${locale}: translated ${completed}/${missing.length}`);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  const ordered = Object.fromEntries(Object.entries(translated).sort(([left], [right]) => left.localeCompare(right)));
  writeFileSync(translationsPath, `${JSON.stringify(ordered, null, 2)}\n`);
  console.log(`Saved ${Object.keys(ordered).length} ${locale} translations.`);
}

for (const locale of requestedLocales) await updateLocale(locale);
