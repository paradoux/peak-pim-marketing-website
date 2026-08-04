# Component inventory

## Layout

- `LandingPageLayout.astro`: SEO, route-specific registered social images, shared Peak PIM application structured data, original Webflow stylesheet, shared header/footer, Crisp, and FAQ setup. Its content wrapper is `main-wrapper`.

## UI emitters

- `Button.astro`: exact `primary`, `secondary`, `alternate`, `secondary-alternate`, and `link` class combinations. CTA wording comes from `src/data/cta-copy.ts`.
- `SectionHeading.astro`: exact centered or left tagline, H1/H2, margin, and lead-copy wrappers.
- `PeakIcon.astro`: approved inline Material icon geometry inside the existing Webflow icon wrapper.
- `ProductVisualFrame.astro`: canonical HTML/CSS product-window frame with the Peak top bar, neutral canvas, thin border, restrained shadow, readiness state, and optional action.
- `Tag.astro`: exact text-tag class emitter.

## Section wrappers

- `Hero.astro`: `peak-hero` (`section_header26`); centered H1, lead, two-button group, wide product visual.
- `LogoCloud.astro`: `peak-logo-cloud` (`section_logo2`); exact compact dark customer-proof strip from the homepage, with its original heading, spacing, and four white merchant logos.
- `ProblemGrid.astro`: `peak-problem-grid` (`section_layout237`); three parallel items with H4 headings.
- `FeatureSteps.astro`: `peak-feature-steps` (`section_layout239`); three equal visual workflow steps.
- `CardGrid.astro`: `peak-card-grid` (`section_layout395`); three complete bordered cards, each containing its visual, tag, H4, and body copy.
- `FeatureGrid.astro`: `peak-feature-grid` (`section_layout353`); left narrative and exactly four sticky capability cards with responsive equal-height synchronization.
- `Testimonial.astro`: `peak-testimonial` (`section_testimonial4`); rating, quote, portrait, attribution, divider, logo.
- `CtaBanner.astro`: `peak-cta-banner` (`section_cta51`); dark card with alternate button pair.
- `Faq.astro`: `peak-faq` (`section_faq1`); existing question/answer hierarchy and shared accordion behavior.
- `ComparisonHero.astro`: `peak-comparison-hero` (`section_header1`); approved split comparison hero.
- `ComparisonVerdict.astro`: `peak-comparison-verdict` (`section_layout140`); concise centered verdict and canonical actions.
- `ComparisonTable.astro`: `peak-comparison-table` (`section_comparison14`); two-card operational comparison.
- `PricingComparison.astro`: `peak-pricing-comparison` (`section_pricing50`); responsive pricing and ownership rows.
- `DecisionGuide.astro`: `peak-decision-guide` (`section_layout4`); decision criteria paired with a registered visual.

## Product visuals

- `TranslationWorkflowDemo.astro`: hero illustration for locale editing, saved states, and regional publishing.
- `TranslationStepVisual.astro`: three compact product states placed inside `layout239_image-wrapper`.
- `TranslationsHeroVisual.astro`: catalog coverage, AI drafting, source review, and publishing in one translation workspace.
- `TranslationsCardVisual.astro`: multi-store matrix, AI draft, and copy-to-store states for complete workflow cards.
- `BuildVsBuyHeroVisual.astro`: registered real-world build-vs-buy evidence screenshot inside a responsive rounded card; this is a page-specific raster exception, not a product-illustration pattern.
- `BuildVsBuyDecisionVisual.astro`: two-path decision brief inside the canonical product-window frame.
- `ImportExportHeroVisual.astro`: import dry-run review with matching, summary states, and before-to-after catalog changes inside the canonical product-window frame.
- `ImportExportCardVisual.astro`: compact export, guided import, and spreadsheet round-trip states for complete workflow cards.
- `DropsHeroVisual.astro`: scheduled Drop review with store-specific catalog diffs, timing, conflict status, and automatic rollback inside the canonical product-window frame.
- `DropsCardVisual.astro`: compact scheduling, preview, and apply-to-restore lifecycle states for complete workflow cards.
- `HealthCenterHeroVisual.astro`: on-demand catalog-health dashboard with six issue themes, cached counts, and the detect-to-fix-to-rerun loop inside the canonical product-window frame.
- `HealthCenterCardVisual.astro`: compact analysis, issue drill-down, and cross-store repair states for complete workflow cards.
- `AiConnectorHeroVisual.astro`: conversational catalog search and draft review inside the canonical Peak product window.
- `AiConnectorCardVisual.astro`: remote connection, permission, and activity-control states for complete workflow cards.
- `AiAssistantHeroVisual.astro`: page-aware in-app conversation with before-and-after draft approval and a separate publish confirmation.
- `AiAssistantCardVisual.astro`: current-page context, draft approval, and confirmed publishing states for complete workflow cards.
- `DeveloperApiHeroVisual.astro`: store-specific PATCH and publish requests beside the unified catalog model.
- `DeveloperApiCardVisual.astro`: compact query, revision-safe update, and multi-store publish states.
- `MetaobjectsHeroVisual.astro`: definition, typed entry fields, and multi-store publishing outcomes in one Peak workspace.
- `MetaobjectsCardVisual.astro`: definition, entry editing, and conflict-aware publishing states for complete workflow cards.
- `MetafieldsHeroVisual.astro`: one account-level metafield definition with typed settings and per-store coverage inside a Peak workspace.
- `MetafieldsCardVisual.astro`: definition, typed value editing, and native Shopify publishing states for complete workflow cards.
- `CustomFieldsHeroVisual.astro`: synced Shopify metafields beside private PIM-only workflow fields on one product record.
- `CustomFieldsCardVisual.astro`: synced, private, and cross-workflow custom-field states for complete workflow cards.
- `RolesPermissionsHeroVisual.astro`: users, example responsibilities, permission boundaries, and store scope in one Peak workspace.
- `RolesPermissionsCardVisual.astro`: invitation, role assignment, and access-review states for complete workflow cards.
- `CollectionsHeroVisual.astro`: one canonical collection with store-specific content, SEO, and product membership coverage inside a Peak workspace.
- `CollectionsCardVisual.astro`: canonical collection, per-store membership, and scheduled merchandising states for complete workflow cards.
- `MarketsCatalogsHeroVisual.astro`: editable variant prices across markets, catalogs, currencies, and Shopify stores inside a Peak workspace.
- `MarketsCatalogsCardVisual.astro`: market setup, catalog scope, and fixed-price states for complete workflow cards.
- `ProductsVariantsHeroVisual.astro`: one canonical product with intentional field and variant differences across connected Shopify stores.
- `ProductsVariantsCardVisual.astro`: canonical store versions, option-change preview, and dependency-aware publishing states for complete workflow cards.
- `HistoryHeroVisual.astro`: account activity with saved and published lenses, authors, sources, and one final store delta.
- `HistoryCardVisual.astro`: saved changes, published changes, and grouped account activity states for complete workflow cards.
- `GlobalSearchHeroVisual.astro`: account-wide command palette with grouped catalog, schema, store, and navigation results inside the canonical Peak product window.
- `GlobalSearchCardVisual.astro`: keyboard shortcut, ranked results, and exact record destination states for complete workflow cards.

## Selection rules

- Select CTA copy by destination from `docs/copywriting-system.md`; use page-specific wording only when it is explicitly approved and registered in `ctaExceptions`.
- Build illustrations in responsive HTML/CSS by default and begin Peak workspace visuals with `ProductVisualFrame.astro`; use raster illustration only when explicitly requested.
- Use the wide `header26` hero for table, catalog, workflow, or comparison product visuals.
- Use `peak-problem-grid` for exactly three parallel problems or benefits.
- Use `peak-feature-steps` for three sequential visual steps.
- Use `peak-card-grid` when the reference shows the visual and copy enclosed in one complete card; never insert only the visual into a card frame.
- Use `peak-feature-grid` for a narrative with a detailed capability list.
- Use exactly four items in `peak-feature-grid`, preserving the legacy `content-item-1` through `content-item-4` positioning hooks. Consolidate content or choose another approved section instead of extending this interaction beyond its original four positions. Keep `data-feature-grid-cards` and the component's font/resize height synchronization so copy wrapping cannot expose earlier cards at intermediate widths.
- Separate dense operational sections with customer proof when possible.
- End public landing pages with `CtaBanner` and `Faq` in the same order as the closest approved reference.
