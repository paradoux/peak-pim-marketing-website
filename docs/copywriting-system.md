# Peak PIM copywriting system

Use this guide with `docs/design-system.md` and `docs/landing-page-recipes.md` whenever creating or substantially revising a marketing page.

## Voice

- Lead with the operating outcome.
- Use short headings and concrete supporting copy.
- Name Shopify objects precisely: products, variants, collections, metafields, metaobjects, media, translations, and stores.
- Prefer direct verbs and plain language. Avoid vague claims such as “revolutionary,” “game-changing,” or “unlock your potential.”
- Do not use em dashes in visible copy, interface examples, structured data, social metadata, or SEO metadata. Rewrite with a full stop, comma, colon, or clearer sentence structure.
- Do not invent customer quotes, quantified outcomes, integrations, limits, prices, or competitor facts.

## Canonical CTA vocabulary

CTA copy describes the action or destination. Use the exported values from `src/data/cta-copy.ts`; do not write a new variant for a page.

| Intent | Required label | Use when |
| --- | --- | --- |
| Start or install Peak PIM | `Get Peak PIM` | The visitor goes directly to the Shopify App Store or installation flow. |
| Start the free trial | `Try for free` | The destination genuinely starts the 10-day free trial. |
| Schedule a demonstration | `Book a demo` | The action opens the demo-booking flow. |
| Start a general sales conversation | `Talk to us` | The action opens Crisp or another general contact flow. |
| View pricing | `See pricing` | The destination is the pricing page or pricing section. |
| View a workflow or product explanation | `See how it works` | The destination explains a feature, solution, or workflow. |
| View a comparison | `See the comparison` or compact `See comparison` | The destination is a comparison page, table, or decision section. Use the compact form in a short paired CTA group. |
| Follow a non-conversion content link | `Learn more` | A more precise canonical action above does not apply. |

### Exceptions

Exceptions are allowed when the page context materially benefits from different wording. They must be explicitly approved, registered in `ctaExceptions` in `src/data/cta-copy.ts`, scoped to the named placement, and covered by the design-system contract. A different CTA order or use of an approved compact label is not an exception.

## CTA rules

- Use sentence case and no ending punctuation.
- Use no more than one primary and one secondary CTA in a section.
- Use one primary conversion label consistently across a page.
- Keep the global header actions as `Book a demo` and `Get Peak PIM`.
- Use `Book a demo` only for scheduling and `Talk to us` only for a general conversation.
- Use `Try for free` only when a free-trial flow is available at the destination.
- Do not add “Peak PIM” when the page already supplies the context, except for the branded `Get Peak PIM` action.
- Retire vague or duplicated variants such as `Ask for a demo`, `Try Peak PIM free`, `Contact sales`, `Ask us anything`, `Explore`, `View`, `See more`, `Full comparison`, and `See current pricing` unless a specific wording is registered as an approved exception.

## Implementation

- Import `ctaLabels` from `src/data/cta-copy.ts` in new Astro pages and reusable sections.
- Type reusable CTA props as `CtaLabel`, which contains the canonical vocabulary plus registered exceptions.
- The recreated-page renderer normalizes historical CTA variants at render time.
- `npm run check:design-system` validates every public page in the sitemap against the canonical vocabulary.
