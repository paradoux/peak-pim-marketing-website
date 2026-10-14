# Partner presentations

The partner site shares the approved marketing components, styles, fonts, visuals,
header, footer, and demo booking. It has its own routes and output directory.
The unfinished `src/content/recreated-pages/partners.html` is never imported.

## Content

- General introduction: `partners/src/pages/index.astro`.
- Personalized routes: `partners/src/pages/[slug].astro`.
- Content records: `partners/src/data/partners.ts`.
- Shared presentation: `partners/src/components/PartnerBrief.astro`.

To add a presentation, add one record to `partners` with a unique lowercase,
hyphenated slug, for example `axome`. Build and verify it before sharing.
Do not invent endorsements, referral fees, or agreed partnership terms. The first
version is English; partner content is separate from the marketing translation queue.

The general page does not list personalized links. All pages carry `noindex` in
their HTML and Cloudflare response headers, and there is no sitemap. This is not
authentication: anyone with a link can view and forward a presentation.

## Development and validation

From the repository root:

```sh
npm run partners:dev
npm run partners:build
npm run partners:check
npm run partners:test
```

The background server runs at `http://localhost:4322`, independently of the
marketing server. Browser tests start a static preview on port 4323 and test the
built output, so run `partners:build` first. In the `partners` directory, manage the
development server with:

```sh
../node_modules/.bin/astro dev status
../node_modules/.bin/astro dev logs
../node_modules/.bin/astro dev stop
```

The build writes to `dist-partners`. Asset preparation copies `public/mirror` and
`public/assets`, excluding unfinished advertising assets. It never copies the
marketing site's redirects, robots rules, sitemap, functions, or bindings.

Partner middleware makes shared marketing navigation absolute; `/` returns to
the partner introduction and `#` links stay on the current page. Booking uses the
shared modal, with the main site's booking URL as its no-JavaScript destination.
The shared layout disables automatic demo prompts, marketing ad tracking, and
language suggestions only for partner pages.

After changes to shared code, also run the normal marketing build and contracts:

```sh
npm run build
npm run check:i18n
npm run check:design-system
git diff --check
```

## Publishing

Use a separate Cloudflare Pages project named `peak-pim-partners`. Create the
project if necessary, and associate `partners.peak-pim.com` under its Custom
domains before configuring the corresponding DNS record. Do not attach it to
the marketing site's Pages project.

From a clean, reviewed checkout containing only the approved changes:

```sh
npm run partners:deploy -- --branch main
```

For commit-pinned deployment, build and check first, then run from `partners`:

```sh
../node_modules/.bin/wrangler pages deploy ../dist-partners --project-name peak-pim-partners --branch main --commit-hash <approved-commit>
```

Verify `/`, `/axome/`, and an unknown path on the live subdomain, including TLS,
404 status, canonical URLs, `X-Robots-Tag`, fonts, navigation, and demo booking.
The main marketing deployment command remains independent.
