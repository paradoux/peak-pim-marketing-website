## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Website-wide working discipline

These rules apply to every change in this repository, including page edits, shared components, navigation, styles, copy, SEO, structured data, tests, and deployment. Apply them proportionally: a trivial one-line change does not need a long written plan, but it still needs a precise scope and a relevant check.

### Think before editing

- Inspect the current implementation and the closest approved pattern before changing code. Search for existing components, styles, copy rules, and tests first.
- State assumptions when they materially affect the result. If multiple interpretations would produce meaningfully different outcomes, surface the choice instead of selecting one silently.
- Prefer the simpler existing pattern when it satisfies the request. Push back when a requested direction would create inconsistency, duplication, or unnecessary risk.
- Define what success looks like before implementation so the result can be verified rather than judged only by whether the code compiled.

### Keep solutions simple

- Write the minimum code required to satisfy the request.
- Do not add speculative flexibility, abstractions, settings, fallbacks, or features that were not requested.
- Reuse an existing component, layout, style, animation, CTA, asset treatment, or content pattern before creating a new one.
- If a small direct change solves the problem safely, do not replace it with a new system.

### Make surgical changes

- Every changed line should trace directly to the user's request or to the verification needed for that request.
- Do not refactor, reformat, rename, or clean up adjacent code unless the requested change makes it necessary.
- Match the existing code and design conventions, even when another approach would also work.
- Preserve unrelated worktree changes. The unfinished `/partners` page must remain excluded unless the user explicitly asks to work on or publish it.
- Remove only imports, variables, styles, tests, or files made obsolete by the current change. Mention unrelated problems instead of fixing them without authorization.

### Work toward verifiable outcomes

- Turn each request into concrete acceptance criteria. For a bug, reproduce the failure first; for a layout change, identify the affected viewport and expected geometry; for content or SEO, identify every consumer that must stay synchronized.
- Add or update a regression check when it can reliably prevent the same issue from returning.
- Run `git diff --check`, `npm run build`, and the relevant contract or visual tests in proportion to the change.
- For visual changes, verify the reported viewport plus 1440px, 768px, and 375px when the change can affect responsive behavior. Include intermediate widths when the failure occurs between standard breakpoints.
- For shared components, navigation, footer, design tokens, or global styles, inspect representative pages from every affected page family.
- Do not stop at a preview URL when production was requested. In this repository, production completion means the approved changes are committed and pushed, `npm run deploy` succeeds, and the affected page is verified on `https://peak-pim.com`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Localization workflow

- English remains the source language at the existing unprefixed URLs. Reviewed French, German, Spanish, Italian, Dutch, Brazilian Portuguese, Polish, and Japanese pages use their locale-prefixed routes registered in `src/i18n/config.ts`.
- Localize each new translated page's handle into the audience's language using short lowercase ASCII words separated by hyphens. Keep a published handle stable; if it must change, add a permanent `301` redirect and update the canonical, reciprocal `hreflang`, internal links, sitemap, and `public/llms.txt` in the same change.
- After changing English source copy that already has a localized equivalent, run `npm run i18n:sync`. Update the translation in the same change or leave the unit explicitly marked `stale` for a later translation batch.
- When a stale translation is reviewed, copy its `observedSourceHash` to `reviewedSourceHash` and set the status to `reviewed` in `src/i18n/status.json`.
- Do not publish automatic English fallbacks under localized URLs. Keep canonicals, reciprocal `hreflang`, the sitemap, structured data, shared navigation, and `public/llms.txt` synchronized.
- Run `npm run check:i18n` after the production build. See `docs/internationalization.md` for the complete workflow.

## Peak PIM landing pages

For any new or substantially redesigned marketing landing page, read and follow:

- `skills/peak-landing-pages/SKILL.md`
- `docs/design-system.md`
- `docs/landing-page-recipes.md`

Compose pages from `src/components/ui`, `src/components/sections`, and `src/components/visuals`. Use `src/layouts/LandingPageLayout.astro` and register approved assets in `src/data/assets.ts` before using them. Add any genuinely new reusable pattern to `/design-system` in the same change.

The `/partners` page is unfinished and must not be used as a design-system reference or source pattern.
