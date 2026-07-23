## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Peak PIM landing pages

For any new or substantially redesigned marketing landing page, read and follow:

- `skills/peak-landing-pages/SKILL.md`
- `docs/design-system.md`
- `docs/landing-page-recipes.md`

Compose pages from `src/components/ui`, `src/components/sections`, and `src/components/visuals`. Use `src/layouts/LandingPageLayout.astro` and register approved assets in `src/data/assets.ts` before using them. Add any genuinely new reusable pattern to `/design-system` in the same change.

The `/partners` page is unfinished and must not be used as a design-system reference or source pattern.
