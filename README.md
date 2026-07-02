# Peak PIM Landing Page

Lightweight Astro landing page configured for Cloudflare Pages.

## Commands

| Command | Action |
| :-- | :-- |
| `npm install` | Install dependencies |
| `npm run dev` | Start local Astro dev server |
| `npm run build` | Build static site into `dist/` |
| `npm run deploy` | Build and deploy `dist/` to Cloudflare Pages |

## Cloudflare Pages

Project name: `peak-pim-marketing-website`

Build command: `npm run build`

Build output directory: `dist`

Wrangler deploy command:

```sh
npm run deploy
```

If Wrangler is not authenticated yet, run:

```sh
npx wrangler login
```
