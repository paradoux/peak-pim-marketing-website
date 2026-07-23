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
| `LogoCloud.astro` | `peak-logo-cloud` | `section_logo3` |
| `ProblemGrid.astro` | `peak-problem-grid` | `section_layout237` |
| `FeatureSteps.astro` | `peak-feature-steps` | `section_layout239` |
| `CardGrid.astro` | `peak-card-grid` | `section_layout395` |
| `FeatureGrid.astro` | `peak-feature-grid` | `section_layout353` |
| `Testimonial.astro` | `peak-testimonial` | `section_testimonial4` |
| `CtaBanner.astro` | `peak-cta-banner` | `section_cta51` |
| `Faq.astro` | `peak-faq` | `section_faq1` |

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
- Page container: `padding-global` → `container-large`
- Standard section spacing: `padding-section-large`

The Webflow stylesheet owns sizing and interaction behavior. Do not override it to make one landing page look different.

All pages also use the original global antialiasing settings (`-webkit-font-smoothing: antialiased` and `-moz-osx-font-smoothing: grayscale`). These are required for Inter body text to render with the same visual weight as the finished Webflow pages.

## Canonical sections

- `Hero.astro` exposes `peak-hero` and emits `section_header26` and `header26_component`.
- `LogoCloud.astro` exposes `peak-logo-cloud` and emits the standard feature-page `section_logo3` strip. The industry-specific `section_logo2` block remains a separate source pattern.
- `ProblemGrid.astro` exposes `peak-problem-grid` and emits `section_layout237`.
- `FeatureSteps.astro` exposes `peak-feature-steps` and emits `section_layout239` and its three-item visual grid.
- `CardGrid.astro` exposes `peak-card-grid` and emits `section_layout395`; every item keeps its visual, tag, heading, and description inside the same bordered card.
- `FeatureGrid.astro` exposes `peak-feature-grid` and emits the original four-card `section_layout353` stack.
- `Testimonial.astro` exposes `peak-testimonial` and emits `section_testimonial4`.
- `CtaBanner.astro` exposes `peak-cta-banner` and emits `section_cta51`.
- `Faq.astro` exposes `peak-faq` and emits `section_faq1`; the shared layout supplies the same accessible accordion behavior as recreated pages.

Keep page content in the route. Keep hierarchy, spacing, classes, buttons, and interaction logic inside the reusable components.

Use `CardGrid` when the approved reference shows complete bordered cards. Use `FeatureSteps` only when the approved reference uses the unbordered `layout239` step treatment. `FeatureGrid` accepts exactly four items and preserves the original `content-item-1` through `content-item-4` sticky behavior from `/1-click-setup`; consolidate content or choose another canonical section instead of adding a fifth card. The component measures the tallest natural card and synchronizes all four card heights after fonts load and whenever the viewport changes, preventing earlier cards from showing behind the final card at any responsive width.

## What may be new

A feature-specific product demonstration may be new when an existing visual cannot explain the workflow. It must sit inside the canonical section wrapper, use registered brand assets, remain legible at 375px, and provide a static state under `prefers-reduced-motion`.

Do not introduce a new heading scale, generic card system, button treatment, container, section rhythm, logo treatment, testimonial layout, CTA, FAQ, or navigation pattern for a single page.

## Review requirements

- Compare computed H1, H2, H4, button, and section-grid styles with the closest approved page.
- Test 1440px, 768px, and 375px widths.
- Check horizontal overflow, one H1, logical hierarchy, keyboard operation, FAQ state, and reduced motion.
- Run `npm run build`, `npm run check:design-system`, and `npm run test:visual`.
- Add any genuinely reusable section wrapper to `/design-system` and to the contract test.
