# Peak PIM design system

The design system is a reusable component layer over the finished Peak PIM website. It does not define a second visual language. The unfinished `/partners` page is excluded from every reference set.

## Source of truth

The canonical typography, color schemes, spacing, containers, grids, buttons, responsive rules, hover transitions, and section behavior come from:

- `public/mirror/peak-pim-landing.webflow.shared.c3ebbebc2-825ab19cb5.css`
- the finished pages in `src/content/recreated-pages`
- the exact Astro wrappers in `src/components/ui` and `src/components/sections`
- the rendered catalogue at `/design-system`

Do not reproduce these rules with page-specific CSS. Components must emit the original class hierarchy and the semantic aliases below.

## Semantic component API

Use the component filename and its `peak-*` alias when discussing, selecting, testing, or extending a section. Numeric Webflow classes remain as compatibility hooks for the original stylesheet; treat them as private implementation details and never remove or rename them without a tested CSS migration.

| Component | Semantic alias | Legacy styling hook |
| --- | --- | --- |
| `Hero.astro` | `peak-hero` | `section_header26` |
| `LogoCloud.astro` | `peak-logo-cloud` | `section_logo2` |
| `ProblemGrid.astro` | `peak-problem-grid` | `section_layout237` |
| `FeatureSteps.astro` | `peak-feature-steps` | `section_layout239` |
| `CardGrid.astro` | `peak-card-grid` | `section_layout395` |
| `FeatureGrid.astro` | `peak-feature-grid` | `section_layout353` |
| `Testimonial.astro` | `peak-testimonial` | `section_testimonial4` |
| `CtaBanner.astro` | `peak-cta-banner` | `section_cta51` |
| `Faq.astro` | `peak-faq` | `section_faq1` |
| `ComparisonHero.astro` | `peak-comparison-hero` | `section_header1` |
| `ComparisonVerdict.astro` | `peak-comparison-verdict` | `section_layout140` |
| `ComparisonTable.astro` | `peak-comparison-table` | `section_comparison14` |
| `PricingComparison.astro` | `peak-pricing-comparison` | `section_pricing50` |
| `DecisionGuide.astro` | `peak-decision-guide` | `section_layout4` |

Child elements use the same BEM-style namespace, such as `peak-feature-grid__card` and `peak-faq__question`. New component behavior and tests should target these semantic aliases. Legacy classes remain present solely to inherit the approved Webflow appearance and existing third-party interactions.

## Canonical primitives

- H1: `heading-style-h1`
- H2: `heading-style-h2`
- Supporting copy: `text-size-medium`
- Primary button: `button w-button`
- Secondary button: `button is-secondary w-button`
- Alternate button: `button is-alternate w-button`
- Alternate secondary: `button is-secondary is-alternate w-button`
- Text link: `button is-link is-icon w-inline-block`
- Product illustration frame: `ProductVisualFrame.astro` → `peak-product-window`
- Page container: `padding-global` → `container-large`
- Standard section spacing: `padding-section-large`

The Webflow stylesheet owns sizing and interaction behavior. Do not override it to make one landing page look different.

### CTA copy

Button appearance comes from the canonical primitives above; button wording comes from `docs/copywriting-system.md` and `src/data/cta-copy.ts`. The approved vocabulary is `Get Peak PIM`, `Try for free`, `Book a demo`, `Talk to us`, `See pricing`, `See how it works`, `See the comparison` (or compact `See comparison`), and `Learn more`.

Registered destination-specific exceptions include `Live demo` for the self-guided product experience and `View API documentation` for the public developer documentation. Keep both scoped to the placements documented in `docs/copywriting-system.md`.

`Book a demo` always opens the shared Google Calendar booking URL from `src/data/cta-copy.ts` in a new tab. It must never trigger Crisp. Reserve Crisp for `Talk to us`, Contact, and other explicitly approved conversation actions.

### Lead capture modal

Use the shared `LeadCaptureModal.astro` system for email capture. Never recreate a form or modal inside a landing page, and never expose a Make.com webhook URL in browser code. Register offer copy and trigger rules in `src/data/lead-offers.ts`, then open it with `data-lead-modal="offer-id"`. See `docs/lead-capture.md` for configuration, privacy, Turnstile, and Make scenario details.

Choose the label from the destination and intent, not from the wording of an individual section. Reusable section props use the `CtaLabel` type, historical recreated pages are normalized when rendered, and the design-system contract checks every public sitemap page. Page-specific wording is allowed only when it is explicitly approved and registered in `ctaExceptions` with a placement-specific test.

All pages also use the original global antialiasing settings (`-webkit-font-smoothing: antialiased` and `-moz-osx-font-smoothing: grayscale`). These are required for Inter body text to render with the same visual weight as the finished Webflow pages.

### Global feature navigation

The header mega menu and footer share the feature taxonomy defined in `src/data/site-navigation.ts`. Every new feature page must be added there so it appears consistently in both locations:

- **Connect**: onboarding, Shopify sync, Amazon sync, the AI Connector (MCP), APIs, and integrations.
- **Operate**: the in-app AI Assistant, multi-store operations, bulk editing, import/export, media management, Drops, Automations, catalog scores, History, global search, catalog health, and team permissions.
- **Manage & Enrich**: products and variants, collections, metafields, metaobjects, translations, Markets and catalog pricing, custom fields, and other structured product-content capabilities.
- **Solutions**: industry- and team-specific landing pages such as Fashion.

The self-guided product experience uses one shared `Live demo` navigation link from `exploreNavigationLinks`. Keep it in the Resources footer column, as a secondary CTA beneath the Peak footer logo, and as a discreet utility link in the Features mega menu. The Resources column also owns Help Center, Product Updates, and API documentation. In the footer bottom bar, keep the Privacy Policy beside the copyright and place the icon-only social links on the right with enough clearance for the chat launcher; preserve their accessible names. Stack these elements cleanly when the row no longer fits. The demo opens in a new tab and must not replace the global `Book a demo` and `Get Peak PIM` actions.

Choose the category from the visitor's job, not from the internal technical architecture. Do not add page-specific feature links directly to `SiteHeader.astro` or `SiteFooter.astro`; update the shared navigation data instead.

Features announced before launch use `comingSoon: true`. Render them as non-interactive text with the shared `Coming soon` badge in the header and footer. Do not assign a placeholder URL, open a chat, or send visitors to an unrelated page. On pricing, show `Coming soon` for every plan until real entitlements have been approved.

When a feature category grows beyond a comfortable single column, keep the taxonomy intact and use the shared `is-dense` two-column treatment on desktop. Return to one column in responsive navigation and footer layouts so labels, descriptions, and status badges remain readable.

Recently launched features use `badge: "New"` in both shared navigation and the pricing matrix. Their links remain active. Use the same compact status badge beside the feature name in the header, footer, and pricing table; do not add separate promotional rows or change plan entitlements.

The pricing feature matrix uses the same Connect, Operate, and Manage & Enrich taxonomy. Plan limits stay in their own group. Every product-feature row includes a native, keyboard-accessible information disclosure with concise explanatory copy and a `Learn more` link when a dedicated landing page exists. Keep the matrix content in `src/data/pricing-feature-matrix.ts` so navigation labels, plan entitlements, and pricing explanations remain easy to audit.

### Landing-page SEO

`LandingPageLayout.astro` owns the shared metadata and structured-data model. Public feature pages must provide a unique title, description, canonical path, Open Graph title, Open Graph description, and FAQ schema. Route-specific 1200 × 630 social images are registered in `src/data/assets.ts` and generated with `npm run generate:og-images`.

Feature pages are described as `WebPage` entities about the single canonical Peak PIM `SoftwareApplication`; do not represent every feature as a separate application. The shared application entity carries the current category, operating system, publisher, and public Core and Elite offers. Every public page belongs in `sitemap.xml` with a source-based modification date and every primary product page belongs in `public/llms.txt`. Keep `/partners`, `/design-system`, `/admin`, and error pages out of the public sitemap.

## Canonical sections

- `Hero.astro` exposes `peak-hero` and emits `section_header26` and `header26_component`.
- `LogoCloud.astro` exposes `peak-logo-cloud` and emits the exact compact dark `section_logo2` proof strip used on the homepage. Feature pages and the Media page must use this shared treatment rather than the retired light scrolling logo strip.
- `ProblemGrid.astro` exposes `peak-problem-grid` and emits `section_layout237`.
- `FeatureSteps.astro` exposes `peak-feature-steps` and emits `section_layout239` and its three-item visual grid.
- `CardGrid.astro` exposes `peak-card-grid` and emits `section_layout395`; every item keeps its visual, tag, heading, and description inside the same bordered card.
- `FeatureGrid.astro` exposes `peak-feature-grid` and emits the original four-card `section_layout353` stack.
- `Testimonial.astro` exposes `peak-testimonial` and emits `section_testimonial4`.
- `CtaBanner.astro` exposes `peak-cta-banner` and emits `section_cta51`.
- `Faq.astro` exposes `peak-faq` and emits `section_faq1`; the shared layout supplies the same accessible accordion behavior as recreated pages.
- `ComparisonHero.astro` exposes `peak-comparison-hero` and emits the split `section_header1` structure used by finished `/vs/*` pages.
- `ComparisonVerdict.astro` exposes `peak-comparison-verdict` and emits their centered `section_layout140` verdict.
- `ComparisonTable.astro` exposes `peak-comparison-table` and emits the two-card `section_comparison14` structure.
- `PricingComparison.astro` exposes `peak-pricing-comparison` and emits the responsive `section_pricing50` ownership and pricing table.
- `DecisionGuide.astro` exposes `peak-decision-guide` and emits the split `section_layout4` decision structure.

Keep page content in the route. Keep hierarchy, spacing, classes, buttons, and interaction logic inside the reusable components.

Use `CardGrid` when the approved reference shows complete bordered cards. Use `FeatureSteps` only when the approved reference uses the unbordered `layout239` step treatment. `FeatureGrid` accepts exactly four items and preserves the original `content-item-1` through `content-item-4` sticky behavior from `/1-click-setup`; consolidate content or choose another canonical section instead of adding a fifth card. The component measures the tallest natural card and synchronizes all four card heights after fonts load and whenever the viewport changes, preventing earlier cards from showing behind the final card at any responsive width.

## What may be new

A feature-specific product demonstration may be new when an existing visual cannot explain the workflow. It must sit inside the canonical section wrapper, remain legible at 375px, and provide a static state under `prefers-reduced-motion`.

### HTML/CSS illustration language

Marketing and product illustrations are responsive HTML/CSS by default. Use a static raster illustration only when the user explicitly requests one. Inline SVG remains appropriate for interface icons; registered logos, customer portraits, and social-share images are assets rather than page illustrations.

Peak workspace illustrations use `ProductVisualFrame.astro` and follow the established pages:

- one coherent application or workflow window rather than floating decorative cards;
- a black top bar, warm neutral canvas, white working panels, and thin grey borders;
- restrained Peak blue for selection and primary actions;
- green only for saved, connected, ready, or published states;
- small operational labels, realistic Shopify objects, compact radii, and subtle shadows;
- motion that demonstrates a real state change and resolves to a useful static state when reduced motion is enabled.

Approved feature-specific product examples include `TranslationWorkflowDemo.astro`, `TranslationStepVisual.astro`, `TranslationsHeroVisual.astro`, `TranslationsCardVisual.astro`, `BuildVsBuyDecisionVisual.astro`, `ImportExportHeroVisual.astro`, `ImportExportCardVisual.astro`, `DropsHeroVisual.astro`, `DropsCardVisual.astro`, `HealthCenterHeroVisual.astro`, `HealthCenterCardVisual.astro`, `AiConnectorHeroVisual.astro`, `AiConnectorCardVisual.astro`, `DeveloperApiHeroVisual.astro`, `DeveloperApiCardVisual.astro`, `MetaobjectsHeroVisual.astro`, `MetaobjectsCardVisual.astro`, `MetafieldsHeroVisual.astro`, `MetafieldsCardVisual.astro`, `CustomFieldsHeroVisual.astro`, `CustomFieldsCardVisual.astro`, `RolesPermissionsHeroVisual.astro`, `RolesPermissionsCardVisual.astro`, `CollectionsHeroVisual.astro`, `CollectionsCardVisual.astro`, `MarketsCatalogsHeroVisual.astro`, `MarketsCatalogsCardVisual.astro`, `ProductsVariantsHeroVisual.astro`, and `ProductsVariantsCardVisual.astro`. They may explain different operations, but they share the same Peak workspace surfaces, borders, states, and responsive behavior.

History uses `HistoryHeroVisual.astro` and `HistoryCardVisual.astro` to distinguish saved edits from published store changes, attribute human, job, and AI activity, and show field-level before and after values without implying one-click rollback.

The AI Assistant uses `AiAssistantHeroVisual.astro` and `AiAssistantCardVisual.astro` to show page-aware catalog reads, before-and-after draft approval, and separate storefront publishing confirmation. Keep it distinct from the external AI Connector (MCP): the Assistant is AI inside Peak PIM with a merchant-provided Anthropic or OpenAI API key, while MCP connects compatible external assistants to Peak PIM.

`BuildVsBuyHeroVisual.astro` is the approved evidence-image exception requested for the comparison page. It uses a registered authentic screenshot inside a responsive, rounded evidence card with Peak styling. Do not reuse that raster treatment for product demonstrations.

Avoid generic illustration metaphors such as sticky notes, arbitrary gradients, oversized arrows, disconnected blobs, or decorative colored panels when a product-workspace view can explain the operation.

Do not introduce a new heading scale, generic card system, button treatment, container, section rhythm, logo treatment, testimonial layout, CTA, FAQ, or navigation pattern for a single page.

## Review requirements

- Compare computed H1, H2, H4, button, and section-grid styles with the closest approved page.
- Test 1440px, 768px, and 375px widths.
- Check horizontal overflow, one H1, logical hierarchy, keyboard operation, FAQ state, and reduced motion.
- Run `npm run build`, `npm run check:design-system`, and `npm run test:visual`.
- Add any genuinely reusable section wrapper to `/design-system` and to the contract test.
