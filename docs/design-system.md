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

Choose the label from the destination and intent, not from the wording of an individual section. Reusable section props use the `CtaLabel` type, historical recreated pages are normalized when rendered, and the design-system contract checks every public sitemap page. Page-specific wording is allowed only when it is explicitly approved and registered in `ctaExceptions` with a placement-specific test.

All pages also use the original global antialiasing settings (`-webkit-font-smoothing: antialiased` and `-moz-osx-font-smoothing: grayscale`). These are required for Inter body text to render with the same visual weight as the finished Webflow pages.

### Global feature navigation

The header mega menu and footer share the feature taxonomy defined in `src/data/site-navigation.ts`. Every new feature page must be added there so it appears consistently in both locations:

- **Connect** — onboarding, Shopify sync, AI connectors, APIs, and integrations.
- **Manage** — multi-store operations, bulk editing, import/export, media management, Drops, catalog health, and team permissions.
- **Enrich** — translations, metaobjects, and other structured product-content capabilities.
- **Solutions** — industry- and team-specific landing pages such as Fashion.

Choose the category from the visitor's job, not from the internal technical architecture. Do not add page-specific feature links directly to `SiteHeader.astro` or `SiteFooter.astro`; update the shared navigation data instead.

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

Approved feature-specific examples include `TranslationWorkflowDemo.astro`, `TranslationStepVisual.astro`, `TranslationsHeroVisual.astro`, `TranslationsCardVisual.astro`, `BuildVsBuyHeroVisual.astro`, `BuildVsBuyDecisionVisual.astro`, `ImportExportHeroVisual.astro`, `ImportExportCardVisual.astro`, `DropsHeroVisual.astro`, `DropsCardVisual.astro`, `HealthCenterHeroVisual.astro`, `HealthCenterCardVisual.astro`, `AiConnectorHeroVisual.astro`, `AiConnectorCardVisual.astro`, `DeveloperApiHeroVisual.astro`, `DeveloperApiCardVisual.astro`, `MetaobjectsHeroVisual.astro`, `MetaobjectsCardVisual.astro`, `MetafieldsHeroVisual.astro`, `MetafieldsCardVisual.astro`, `CustomFieldsHeroVisual.astro`, `CustomFieldsCardVisual.astro`, `RolesPermissionsHeroVisual.astro`, and `RolesPermissionsCardVisual.astro`. They may explain different operations, but they share the same Peak workspace surfaces, borders, states, and responsive behavior.

Avoid generic illustration metaphors such as sticky notes, arbitrary gradients, oversized arrows, disconnected blobs, or decorative colored panels when a product-workspace view can explain the operation.

Do not introduce a new heading scale, generic card system, button treatment, container, section rhythm, logo treatment, testimonial layout, CTA, FAQ, or navigation pattern for a single page.

## Review requirements

- Compare computed H1, H2, H4, button, and section-grid styles with the closest approved page.
- Test 1440px, 768px, and 375px widths.
- Check horizontal overflow, one H1, logical hierarchy, keyboard operation, FAQ state, and reduced motion.
- Run `npm run build`, `npm run check:design-system`, and `npm run test:visual`.
- Add any genuinely reusable section wrapper to `/design-system` and to the contract test.
