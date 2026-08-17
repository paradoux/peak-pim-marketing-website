# Peak PIM internationalization workflow

English remains the source language at the existing unprefixed URLs. Localized pages use `/fr/`, `/de/`, `/es/`, `/it/`, `/nl/`, `/pt-br/`, `/pl/`, and `/ja/` URLs and reuse the same page templates, with a cached localization layer applied to rendered text, image alt text, metadata, structured data, and internal links at build time. A localized route is public only when its complete visible content, metadata, structured data, language links, and sitemap alternates are ready.

## Working rules

- Keep existing English URLs unchanged.
- Give each localized page a short, descriptive handle in its audience's language. Use lowercase ASCII words separated by hyphens, record the independent paths in `src/i18n/config.ts`, and keep the handle stable after publication.
- If a published localized handle must change, preserve the old URL with a permanent `301` redirect and update its canonical, `hreflang`, internal links, sitemap entry, and `llms.txt` reference together.
- Add only reviewed localized routes to `src/i18n/config.ts` and `src/pages/sitemap.xml.ts`.
- Never publish English content beneath a localized URL as a fallback.
- Every localized page uses a self-referencing canonical plus reciprocal alternates for all nine languages and `x-default`.
- Translate factual changes, pricing, product availability, legal copy, shared navigation, and SEO metadata in the same change.
- Minor English copy refinements may enter the stale-translation queue.
- Keep the privacy policy, `/admin`, `/design-system`, the unfinished `/partners` page, and other non-marketing utility pages outside the localized route registry unless their scope is explicitly approved.

## Shopify terminology

Use the vocabulary from Shopify's localized Help Center when a Shopify concept has an official translation. Keep `Shopify`, `Shopify Markets`, `Peak PIM`, plan names, integration names, API, MCP, PIM, SKU, CSV, and JSON unchanged. The translation generator applies reviewed locale-specific terms for metafields, metaobjects, bulk editing, Shopify Admin, merchants, stores, and URL handles. French uses:

- `metafield` → `champ méta`
- `metaobject` → `métaobjet`
- `variant` → `variante`
- `Shopify admin` → `interface administrateur Shopify`
- `bulk editor` → `éditeur en bloc`; marketing copy may use `modification en bloc`
- `handle` → `identifiant d’URL`
- `store` → `boutique`; `storefront` → `boutique en ligne`
- `merchant` → `marchand`

Primary references: [Shopify variants](https://help.shopify.com/fr/manual/products/variants), [Shopify metafields](https://help.shopify.com/fr/manual/custom-data/metafields), [Shopify metaobjects](https://help.shopify.com/fr/manual/custom-data/metaobjects), [Shopify product import/export](https://help.shopify.com/fr/manual/products/import-export), and [Shopify Markets catalogs](https://help.shopify.com/fr/manual/international/publishing-products).

## Visitor language preference

Language detection is client-side and uses `navigator.languages`; it never uses IP or geolocation. Without a saved preference, a visitor whose first supported browser language differs from the current page sees an optional suggestion written in that detected language. The action to keep the current page is written in the current page's language. Accepting either choice or choosing a language in the footer stores `peak-preferred-locale` in local storage.

A saved non-English choice redirects only the unprefixed homepage to its localized homepage. Direct deep links are never automatically replaced, so shared URLs and search results remain respected. The suggestion is hidden in the server-rendered HTML and does not change canonicals, `hreflang`, sitemap entries, or crawler routing.

## After changing English source copy

Run:

```sh
npm run i18n:sync
```

The command records the current source fingerprint in `src/i18n/status.json`. When localized content has not yet been reviewed against that fingerprint, its unit becomes `stale`. Builds continue, but the queue remains visible.

For a translation batch, build the latest English pages, update every localized cache, and build again:

```sh
npm run build
npm run i18n:translate
npm run build
```

`i18n:translate` keeps existing reviewed strings, adds only missing rendered strings, and applies the Shopify terminology rules above. Pass `-- --locale fr` (or another supported locale) to update one cache. It covers visible text, titles, descriptions, Open Graph and Twitter metadata, image alt text, and JSON-LD values. URL handles remain governed by the explicit route registry in `src/i18n/config.ts`.

After translating and reviewing the affected localized content, copy the unit's `observedSourceHash` to `reviewedSourceHash` and set its status to `reviewed`. `npm run check:i18n` verifies the rendered language, canonicals, `hreflang`, structured data, sitemap, language switcher, and translation status.

Pages with no localized version do not need per-change tracking. When a public marketing page is added, register all nine paths, build once, run `npm run i18n:translate`, rebuild, verify its rendered SEO contract and footer switcher, then add its English source to the public-page translation unit.
