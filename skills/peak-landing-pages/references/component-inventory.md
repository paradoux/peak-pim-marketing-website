# Component inventory

## Layout

- `LandingPageLayout.astro`: SEO, structured data, original Webflow stylesheet, shared header/footer, Crisp, and FAQ setup. Its content wrapper is `main-wrapper`.

## UI emitters

- `Button.astro`: exact `primary`, `secondary`, `alternate`, `secondary-alternate`, and `link` class combinations.
- `SectionHeading.astro`: exact centered or left tagline, H1/H2, margin, and lead-copy wrappers.
- `PeakIcon.astro`: approved inline Material icon geometry inside the existing Webflow icon wrapper.
- `Tag.astro`: exact text-tag class emitter.

## Section wrappers

- `Hero.astro`: `peak-hero` (`section_header26`); centered H1, lead, two-button group, wide product visual.
- `LogoCloud.astro`: `peak-logo-cloud` (`section_logo3`); standard light customer-proof strip with the medium-weight logo heading and approved black logos.
- `ProblemGrid.astro`: `peak-problem-grid` (`section_layout237`); three parallel items with H4 headings.
- `FeatureSteps.astro`: `peak-feature-steps` (`section_layout239`); three equal visual workflow steps.
- `CardGrid.astro`: `peak-card-grid` (`section_layout395`); three complete bordered cards, each containing its visual, tag, H4, and body copy.
- `FeatureGrid.astro`: `peak-feature-grid` (`section_layout353`); left narrative and exactly four sticky capability cards with responsive equal-height synchronization.
- `Testimonial.astro`: `peak-testimonial` (`section_testimonial4`); rating, quote, portrait, attribution, divider, logo.
- `CtaBanner.astro`: `peak-cta-banner` (`section_cta51`); dark card with alternate button pair.
- `Faq.astro`: `peak-faq` (`section_faq1`); existing question/answer hierarchy and shared accordion behavior.

## Product visuals

- `TranslationWorkflowDemo.astro`: hero illustration for locale editing, saved states, and regional publishing.
- `TranslationStepVisual.astro`: three compact product states placed inside `layout239_image-wrapper`.

## Selection rules

- Use the wide `header26` hero for table, catalog, workflow, or comparison product visuals.
- Use `peak-problem-grid` for exactly three parallel problems or benefits.
- Use `peak-feature-steps` for three sequential visual steps.
- Use `peak-card-grid` when the reference shows the visual and copy enclosed in one complete card; never insert only the visual into a card frame.
- Use `peak-feature-grid` for a narrative with a detailed capability list.
- Use exactly four items in `peak-feature-grid`, preserving the legacy `content-item-1` through `content-item-4` positioning hooks. Consolidate content or choose another approved section instead of extending this interaction beyond its original four positions. Keep `data-feature-grid-cards` and the component's font/resize height synchronization so copy wrapping cannot expose earlier cards at intermediate widths.
- Separate dense operational sections with customer proof when possible.
- End public landing pages with `CtaBanner` and `Faq` in the same order as the closest approved reference.
