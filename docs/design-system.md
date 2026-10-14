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
| `CustomerStoryHero.astro` | `peak-customer-story-hero` | `section_header84` |
| `CustomerStoryStats.astro` | `peak-customer-story-stats` | `section_stats26` |
| `SocialProofStats.astro` | `peak-social-proof-stats` | `section_stats26` |
| `CustomerStoryChapter.astro` | `peak-customer-story-chapter` | `section_layout358` |

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

The shared primary-button interaction in `src/styles/global.css` changes dark buttons to Peak blue with white text on hover and keyboard focus, using a 180ms color transition. It preserves the pill geometry, respects reduced motion, and excludes secondary, alternate, and text-link variants.

### CTA copy

Button appearance comes from the canonical primitives above; button wording comes from `docs/copywriting-system.md` and `src/data/cta-copy.ts`. The approved vocabulary is `Get Peak PIM`, `Try for free`, `Book a demo`, `Talk to us`, `See pricing`, `See how it works`, `See the comparison` (or compact `See comparison`), and `Learn more`.

Registered destination-specific exceptions include `Live demo` for the self-guided product experience and `View API documentation` for the public developer documentation. Keep both scoped to the placements documented in `docs/copywriting-system.md`.

`Book a demo` opens the shared `DemoBookingModal.astro`, with an accessible Google Calendar embed and an optional own-catalog live demo introduction. Its link points to the localized `/book-a-demo/` page so direct sharing, modified clicks, and navigation without JavaScript still work. The calendar loads only when the modal opens. It must never trigger Crisp. Reserve Crisp for `Talk to us`, Contact, and other explicitly approved conversation actions.

### Lead capture modal

Use the shared `DemoBookingModal.astro` for “See Peak with your own data”. Open it with a `/book-a-demo/` link and `data-demo-booking`; never recreate the booking modal inside a landing page. The automatic prompt uses `demoAutoOpen` in `src/data/cta-copy.ts`. See `docs/lead-capture.md` for trigger rules and the retained legacy trial infrastructure.

Choose the label from the destination and intent, not from the wording of an individual section. Reusable section props use the `CtaLabel` type, historical recreated pages are normalized when rendered, and the design-system contract checks every public sitemap page. Page-specific wording is allowed only when it is explicitly approved and registered in `ctaExceptions` with a placement-specific test.

All pages also use the original global antialiasing settings (`-webkit-font-smoothing: antialiased` and `-moz-osx-font-smoothing: grayscale`). These are required for Inter body text to render with the same visual weight as the finished Webflow pages.

### Global feature navigation

The header mega menu and footer share the feature taxonomy defined in `src/data/site-navigation.ts`. Every new feature page must be added there so it appears consistently in both locations:

- **Connect**: onboarding, Shopify sync, Amazon sync, the AI Connector (MCP), APIs, and integrations.
- **Operate**: the in-app AI Assistant, multi-store operations, bulk editing, import/export, media management, Drops, Automations, catalog scores, History, global search, catalog health, and team permissions.
- **Manage & Enrich**: products and variants, collections, metafields, metaobjects, translations, Markets and catalog pricing, custom fields, and other structured product-content capabilities.
- **Solutions**: industry- and team-specific landing pages such as Fashion.

The self-guided product experience uses one shared `Live demo` navigation link from `exploreNavigationLinks`. Keep it in the Resources footer column, as a secondary CTA beneath the Peak footer logo, and as a discreet utility link in the Features mega menu. The Resources column also owns Help Center, Product Updates, and API documentation. In the footer bottom bar, keep the Privacy Policy beside the copyright and place the icon-only social links on the right with enough clearance for the chat launcher; preserve their accessible names. Stack these elements cleanly when the row no longer fits. The self-guided demo opens in a new tab. The global header has one primary `Demo with your data` CTA for the scheduled demo, opening the shared booking modal.

Choose the category from the visitor's job, not from the internal technical architecture. Do not add page-specific feature links directly to `SiteHeader.astro` or `SiteFooter.astro`; update the shared navigation data instead.

Features announced before launch use `comingSoon: true`. Render them as non-interactive text with the shared `Coming soon` badge in the header and footer. Do not assign a placeholder URL, open a chat, or send visitors to an unrelated page. On pricing, show `Coming soon` for every plan until real entitlements have been approved.

When a feature category grows beyond a comfortable single column, keep the taxonomy intact and use the shared `is-dense` two-column treatment on desktop. Return to one column in responsive navigation and footer layouts so labels, descriptions, and status badges remain readable.

Recently launched features use `badge: "New"` in both shared navigation and the pricing matrix. Their links remain active. Use the same compact status badge beside the feature name in the header, footer, and pricing table; do not add separate promotional rows or change plan entitlements.

The header Resources dropdown reuses `resourceNavigationLinks` from the shared navigation data. Keep it compact and limited to Live demo, Help Center, Product Updates, and API documentation. The footer uses the same destinations, so resource links and external behavior stay synchronized.

The pricing feature matrix uses the same Connect, Operate, and Manage & Enrich taxonomy. Plan limits stay in their own group. Every product-feature row includes a native, keyboard-accessible information disclosure with concise explanatory copy and a `Learn more` link when a dedicated landing page exists. Keep the matrix content in `src/data/pricing-feature-matrix.ts` so navigation labels, plan entitlements, and pricing explanations remain easy to audit.

### Landing-page SEO

`LandingPageLayout.astro` owns the shared metadata and structured-data model. Public feature pages must provide a unique title, description, canonical path, Open Graph title, Open Graph description, and FAQ schema. Route-specific 1200 × 630 social images are registered in `src/data/assets.ts` and generated with `npm run generate:og-images`.

Feature pages are described as `WebPage` entities about the single canonical Peak PIM `SoftwareApplication`; do not represent every feature as a separate application. The shared application entity carries the current category, operating system, publisher, and public Core and Elite offers. Every public page belongs in `sitemap.xml` with a source-based modification date and every primary product page belongs in `public/llms.txt`. Keep `/partners`, `/design-system`, `/admin`, and error pages out of the public sitemap.

## Canonical sections

- `Hero.astro` exposes `peak-hero` and emits `section_header26` and `header26_component`.
- `LogoCloud.astro` exposes `peak-logo-cloud` and emits the shared dark `section_logo2` merchant marquee used on the homepage. Twelve linked logos move slowly in one muted row with fading edges; a repeated group makes the loop seamless without adding duplicate keyboard stops. Hover or focus stops motion. Customer-story badges open the approved previews above the row. Keyboard navigation and reduced motion show a static grid of the original links. Feature pages and the Media page use the same treatment.
- `ProblemGrid.astro` exposes `peak-problem-grid` and emits `section_layout237`.
- `FeatureSteps.astro` exposes `peak-feature-steps` and emits `section_layout239` and its three-item visual grid.
- `CardGrid.astro` exposes `peak-card-grid` and emits `section_layout395`; every item keeps its visual, tag, heading, and description inside the same bordered card.
- Its `variant="text"` treatment reuses the homepage outcomes card pattern: optional icons, two static columns above 991px, and one column below. It has no image area or sticky stack. An optional footer slot holds a shared CTA button. The agency-benefits example is shown in `/design-system`.
- `FeatureGrid.astro` exposes `peak-feature-grid` and emits the original four-card `section_layout353` stack.
- `Testimonial.astro` exposes `peak-testimonial` and emits `section_testimonial4`.
- `CtaBanner.astro` exposes `peak-cta-banner` and emits `section_cta51`.
- `Faq.astro` exposes `peak-faq` and emits `section_faq1`; the shared layout supplies the same accessible accordion behavior as recreated pages.
- `ComparisonHero.astro` exposes `peak-comparison-hero` and emits the split `section_header1` structure used by finished `/vs/*` pages.
- `ComparisonVerdict.astro` exposes `peak-comparison-verdict` and emits their centered `section_layout140` verdict.
- `ComparisonTable.astro` exposes `peak-comparison-table` and emits the two-card `section_comparison14` structure.
- `PricingComparison.astro` exposes `peak-pricing-comparison` and emits the responsive `section_pricing50` ownership and pricing table.
- `DecisionGuide.astro` exposes `peak-decision-guide` and emits the split `section_layout4` decision structure.
- `CustomerStoryHero.astro` exposes `peak-customer-story-hero` and emits the editorial split `section_header84` structure with a registered customer portrait and logo.
- `CustomerStoryStats.astro` exposes `peak-customer-story-stats` and emits the existing dark `section_stats26` proof summary without inventing unsupported metrics.
- `IntegrationIntroduction.astro` uses a centered `SectionHeading`, the supplied full-width `BuildAroundYourBusiness` animation, and the existing `Learn more` link with medium section spacing before setup. See the homepage integration animation notes below.
- `IntegrationEcosystem.astro` composes the existing `CardGrid` with three `IntegrationLogoGroup` visuals for storefronts, marketplaces, and operations. Use the registered logo assets with matched visual sizing and monochrome CSS; keep Shopify native, Amazon coming soon, and custom-connection wording explicit. It remains in the design-system catalogue for the larger integration section.
- `SocialProofStats.astro` exposes `peak-social-proof-stats` and uses the open cream layout: a left-aligned heading beside ink-colored account or customer numbers, followed by a linked-logo row with a single horizontal divider and no enclosing card. Maéli Paris and Du Bruit dans la Cuisine reuse the shared case-study badges, hover/focus previews, and internal story links; touch layouts link directly to the stories. Each number must name its scope, and external merchant links use `nofollow noopener`.
- `CustomerStoryChapter.astro` exposes `peak-customer-story-chapter` and emits the alternating `section_layout358` editorial chapter used for real setup, workflow, and outcome narratives.

Keep page content in the route. Keep hierarchy, spacing, classes, buttons, and interaction logic inside the reusable components.

Customer stories use registered portraits and logos, verified quotes, and outcomes supplied or approved by the customer. Never turn a product capability into an attributed customer claim without evidence. Compose the story from `CustomerStoryHero`, `CustomerStoryStats`, the existing `Testimonial`, alternating `CustomerStoryChapter` sections, `CtaBanner`, and `Faq`.

Use `CardGrid` when the approved reference shows complete bordered cards. Use `FeatureSteps` only when the approved reference uses the unbordered `layout239` step treatment. `FeatureGrid` accepts exactly four items and preserves the original `content-item-1` through `content-item-4` sticky behavior from `/1-click-setup`; consolidate content or choose another canonical section instead of adding a fifth card. The component measures the tallest natural card and synchronizes all four card heights after fonts load and whenever the viewport changes, preventing earlier cards from showing behind the final card at any responsive width.

## What may be new

`HomepageComparison.astro` reuses the alternatives guide's `section_comparison11` table between homepage setup and the Maéli Paris customer story and appears in `/design-system`. It compares Peak PIM, Akeneo Advanced/Premium, and Shopify with a patchwork of apps. Keep the existing logo, divider, cell, and section treatments. On mobile, each row label spans all three option columns. Use plan-qualified capabilities, the shared Peak pricing data, and current official competitor sources; do not infer a fixed cost for an unspecified app stack. The table starts with “Solution”. Its app-stack header combines the existing Shopify bag mark with rounded official icons for Matrixify, Syncio, Booster SEO, and Transcy in a single, slightly overlapping row ending with a circular “+5” badge. The entire group stays on one line at every viewport width. App names remain available through image alternatives and native hover titles. Capability rows use accessible checkmarks and crosses, with short plan or connector qualifiers where needed. App-dependent support stays labeled “Depends on apps”; a cross means the capability is absent, not merely provided by a separate app. Type, price, and setup retain text. There are no visible comparison notes. All eight locale dictionaries translate the section.

Comparison evidence (reviewed 2026-10-14): [Peak PIM plans](https://apps.shopify.com/peak-pim), [Akeneo packages](https://www.akeneo.com/compare-packages/), [Akeneo Shopify compatibility](https://help.akeneo.com/en_US/shopify-app-overview/shopify-app-prerequisites-compatibility), [Akeneo metaobject mapping](https://help.akeneo.com/en_US/shopify-app-features/shopify-app-reference-entity-mapping), and [Shopify bulk editing](https://help.shopify.com/en/manual/shopify-admin/productivity-tools/bulk-editing). App-stack icons come from the official [Matrixify](https://apps.shopify.com/excel-export-import), [Syncio](https://apps.shopify.com/syncio), [Booster SEO](https://apps.shopify.com/booster-apps-seo-optimizer), and [Transcy](https://apps.shopify.com/transcy-multiple-languages) listings. They represent common specialist apps, not an install-count ranking or an exact feature-equivalent bundle.

`HomepageFeatures.astro` is the homepage's tabbed feature showcase, also shown on `/design-system`. It pairs the existing centered section heading with a compact segmented tab row, the selected feature's centered description between the tabs and one large rounded product preview. It has no repeated feature title or install CTA. The tabs show Multi-stores, Bulk Edit, Media Management, Drops, and Automations, in that order. All five features display supplied product captures in the same softly bordered browser frame on the dark preview background, preserving each complete image at every viewport. The preview height follows the screenshot proportions, with consistent padding above and below every frame. Automations retains its Coming soon badge in the frame bar. Copy uses the existing locale dictionaries. Every preview uses the same dark dot-pattern background, independent of illustration scaling. An Explore all control beside the tabs opens the existing header Features menu, including the mobile navigation. Tabs support click, touch, arrow keys, Home, and End; their row scrolls horizontally on narrow screens. Panels switch on selection, with a short entrance transition disabled under reduced motion.

`HomepageWorkflows.astro` is the homepage workflow-card pattern, shown in `/design-system`. It reuses `SectionHeading`, the existing complete-card structure, standard heading container and section spacing. Thirteen dark, borderless cards share one full-width horizontal row, with “Create your own workflow” third. It scrolls continuously at 12.75 pixels per second, slower than the logo marquee, with no fading at the screen edges; the card row sits outside the heading container. Hover pauses automatic movement for native scrolling without requiring a click; movement resumes from that position on exit. Keyboard focus and reduced motion also support native scrolling. The third card is a large centered plus above its title, with no supporting copy. Each card exists once; cards that leave the viewport move to the end of the row to maintain the infinite loop. There are no product visuals, step strips, section CTAs, or navigation arrows. Below 768px, cards retain the slow automatic loop with smaller spacing and a glimpse of the next card. Touch pauses movement for native swiping; the loop resumes from the new position after touch scrolling settles. Reduced-motion users get a static swipe row. The section is currently an English-only preview; translations remain pending.

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

Global Search uses `GlobalSearchHeroVisual.astro` and `GlobalSearchCardVisual.astro` to show the account-wide command palette, honest searchable identifiers, grouped result context, keyboard navigation, and direct record destinations. Do not imply full-text search across product descriptions or metafield values.

Carré Coco uses `CarreCocoMultiStoreVisual.astro` inside the approved customer-story chapter pattern to show one shared product record with deliberate B2C and B2B prices, descriptions, and publishing destinations. Keep the visual factual and do not insert unverified customer figures.

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

### Live demo booking

`DemoBooking.astro` shares the introductory copy and Google booking calendar between the modal and dedicated booking page. `DemoBookingModal.astro` uses the existing native-dialog interaction pattern, cream and white surfaces, keyboard dismissal, focus restoration, scroll locking, and reduced-motion support. Keep booking details in Google Calendar; do not duplicate availability or collect a second booking form.

### Agency one-pagers

`OnePagerHeader.astro` (`peak-one-pager-header`) is the approved section-only header for partner presentations. It accepts hash links only and uses a native disclosure menu below 992px. `PartnerBrand.astro` (`peak-partner-brand`) pairs the registered Peak and partner logos. `PartnerContact.astro` (`peak-partner-contact`) reuses the CTA card for direct email, LinkedIn, and website links. All three render in `/design-system`.

`LandingPageLayout` exposes optional `header` and `footer` slots; ordinary marketing pages retain their shared navigation. `Hero` exposes an optional `brand` slot above its H1. Agency one-pagers use Hero, ProblemGrid, visual CardGrid, FeatureSteps, text CardGrid, and PartnerContact in that order.

### Homepage split hero

`HomepageHero.astro` reuses `Hero` with its split layout and the existing homepage announcement, rating, description, and Book a demo button. `HomepageHeroAnimation.astro` contains the supplied three-scene catalog animation and registered product photo. The columns stack below 1024px; the animation uses its compact composition below a 480px container width, reserves its canvas aspect ratio, and shows the published stores when reduced motion is enabled. This English homepage preview is also shown in `/design-system`.

`HomepageShopifyBenefits.astro` uses `CardGrid` for the homepage “Built for Shopify merchants” section. `ShopifyNativeAnimation.astro` supplies the approved connection, two-way sync, and catalog coverage animations in square visual slots. The supplied English product-demo labels, colors, and 1.3 pace are preserved; surrounding card copy remains localized. Each demo has an accessible image label, scales with its card, and displays its final state with reduced motion. The section is also rendered in `/design-system`.

### Homepage integration animation

`IntegrationIntroduction.astro` places the existing centered `SectionHeading` above the supplied `BuildAroundYourBusiness.astro` animation, followed by the existing custom-integrations link. The animation replaces the homepage logo group and is also rendered in `/design-system`. Its 1200px canvas shows sources flowing through Peak PIM to sales channels; below 860px of container width it switches to the supplied vertical layout. Preserve the supplied `ppim-ba-` names, labels, colors, and 1.3 pacing. The diagram remains an English product demonstration (`lang="en"`, `data-i18n-skip`) with localized surrounding copy, like the other supplied homepage animations. Reduced motion shows updated channel states, and the loop waits between flows while offscreen or the tab is hidden.
