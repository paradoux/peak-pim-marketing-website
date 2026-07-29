---
name: peak-landing-pages
description: Build or substantially redesign Peak PIM marketing landing pages in the Astro website while preserving the exact existing components, class hierarchy, typography, buttons, logos, product-demo logic, responsive behavior, and conversion structure.
---

# Peak landing pages

Build by exact composition. The system wraps the finished website’s original Webflow structures; it is not a parallel design language.

## Required context

Read before editing:

1. `docs/design-system.md`
2. `docs/copywriting-system.md`
3. `docs/landing-page-recipes.md`
4. `references/component-inventory.md`
5. The two closest approved finished pages from `src/data/landing-page-recipes.ts`

Never use `/partners` as a reference. It is unfinished.

## Workflow

1. Choose the closest feature, use-case, industry, or comparison page.
2. Map each required section to an existing Webflow structure and reusable Astro wrapper.
3. Use `LandingPageLayout.astro` and compose the route from `src/components/sections`.
4. Compose with the semantic `peak-*` component API while preserving original Webflow class names, wrapper order, heading levels, spacing utilities, button variants, color schemes, and interaction logic. Treat numeric `layout*` and `section_*` names as private compatibility hooks, not the names used to select or describe components.
   - For complete visual-and-copy cards, use `CardGrid.astro` (`section_layout395`) so the border encloses the whole card.
   - `FeatureGrid.astro` is the exact four-card sticky structure from `/1-click-setup`. Never pass a fifth item; consolidate the content or choose another canonical section. Its built-in responsive height synchronization must remain intact so the final card covers the stack at every viewport width.
5. Change page copy and data only. Create a product visual only when the operation is genuinely new. Build it in responsive HTML/CSS by default and use `ProductVisualFrame.astro` for Peak workspace illustrations.
6. Use the canonical CTA labels exported by `src/data/cta-copy.ts`, or a placement-specific exception already registered there, following `docs/copywriting-system.md`.
7. Register any new asset in `src/data/assets.ts`.
8. Add a genuinely new reusable wrapper to `/design-system` and the contract test.
9. Add a public route to the sitemap and `public/llms.txt`; never add `/design-system`. Register its route-specific Open Graph image in `src/data/assets.ts`, add it to `scripts/generate-og-images.mjs`, and run `npm run generate:og-images`.
10. Build and compare computed type, button, and grid styles with the approved reference page.
11. Review at 1440px, 768px, and 375px.

## Guardrails

- Never introduce `ds-*` page components or a second token/typography system.
- Never recreate a heading, button, card, section grid, CTA, FAQ, testimonial, logo cloud, or spacing rule that already exists.
- Do not override canonical Webflow styles for one page.
- Page-specific CSS is limited to the inside of a feature-specific product illustration.
- Product motion may demonstrate select, edit, save, sync, publish, or progress and must support reduced motion.
- Marketing and product illustrations must use responsive HTML/CSS by default; inline SVG is allowed for icons. Use a static raster illustration only when the user explicitly requests one. Logos, customer portraits, and social-share images remain registered assets rather than page illustrations.
- Keep one H1, logical heading hierarchy, visible focus, keyboard operation, and no horizontal overflow.
- Do not invent testimonials, customer outcomes, limits, prices, integrations, or competitor facts.
- Keep the shared header, footer, Peak logo, and customer-logo treatments unchanged.
- Never invent a new CTA label without explicit approval. Use `Get Peak PIM`, `Try for free`, `Book a demo`, `Talk to us`, `See pricing`, `See how it works`, `See the comparison` (or compact `See comparison`), or `Learn more` according to the destination; register any approved exception in `ctaExceptions` and test its exact placement.

## Completion checklist

- Exact canonical sections reused
- Exact heading and button classes preserved
- Product visual explains one real operation
- Desktop, tablet, mobile, keyboard, and reduced-motion checks pass
- Metadata, canonical, route-specific social image, shared-application schema, FAQ schema, sitemap, and `llms.txt` are correct
- CTA labels and destinations follow the copywriting system
- `/design-system` shows the real production components
- No `/partners` pattern was used
