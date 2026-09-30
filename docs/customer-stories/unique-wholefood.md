# Unique Wholefood customer story evidence

Reviewed on 2026-09-29. This file is an internal source map, not public page content.

## Coverage

- [Peak PIM lead](https://app.notion.com/p/31ff2e01b0b98071a74cd26b26d9dda3): all body blocks and nested history, including five email-thread summaries and three meeting entries. History spans May through September 2026, with a March demo linked from the properties.
- [Peak PIM account](https://app.notion.com/p/3bff2e01b0b9819a9badeaf6cb316cea): located through the matching [Shopify store](https://app.notion.com/p/351f2e01b0b981d5afacee8f75469ae9), because the lead has no account relation. The account body is empty; its incomplete rollups are not evidence of catalog size or subscription status.
- [Wayne's contact](https://app.notion.com/p/391f2e01b0b981ea9c85c45f8bafee86): name and Online Operations Manager role. The other linked contact and the [SyncBase user](https://app.notion.com/p/21cf2e01b0b981cab7b6d21fa63d908a) were also inspected.
- All four linked meeting documents were retrieved with their available tabs: [March 13 demo](https://docs.google.com/document/d/1EX6LvRkCUY0T_myk5S2YecDwxtrThwzvyPIy4erixJI/edit), [June 26 product tour](https://docs.google.com/document/d/15WWKX1UO8_rNz7MZOL4RfC7emNuOq9GdMNNIRvuUGlQ/edit), [August 14 AI workflow review](https://docs.google.com/document/d/18dHPtZI3zFmUurdEY1OHhwVL5qBPO8B8W1jxnDIP0j8/edit), and [September 9 final flow check](https://docs.google.com/document/d/1wUpcaJNnvvqmtQ-koIHJMu6mP0S0QZ8lTQd9jY9cm3E/edit). The March file contains only a brief opening conversation. The content research uses the later operational notes and relevant transcript passages.
- Latest five-star review: user-supplied screenshot, `Capture d’écran 2026-09-29 à 22.03.39.png`. The screenshot date is not asserted as the review's publication date. The visible AI paragraph is quoted verbatim, including “soo”. The cropped final paragraph is not used as a complete quote.

## Claims used

| Claim | Evidence |
| --- | --- |
| More than 10,000 products | Latest supplied review. This is a product count, not the historical SyncBase variant count. |
| POS products arrive in Shopify as drafts; titles and content need enrichment | June 26 notes, 00:28:09–00:33:59. |
| Previous workflow involved Airtable, SyncBase, Make, and AI-generated product content | June 26 and August 14 operational workflow discussions. |
| Separate prompts and generation actions for individual fields | June 26 requirements; August 14 implementation discussion; September 9 prompt testing and conditional configuration, 01:07:53–01:11:07; latest review confirms descriptions and custom-field copy. |
| Collection filtering and product/variant columns | September 9 walkthrough, 00:06:33. |
| Peak PIM can cover Wayne's daily catalog work | September 9 transcript around 00:16:57 and 00:38:19: when asked whether he still needs Airtable or Shopify for those operations, Wayne says he does not think so. Team migration/training remained in progress. Do not claim every tool was decommissioned company-wide. |
| Image copy/paste is useful and saves time | September 9 live testing, 01:20:24–01:24:03, corroborated by the latest review. |
| Familiar bulk operations and direct support | Latest supplied review. |

The three product visuals are explicitly illustrative workflows, not screenshots of Wayne's account or measured outputs. No claim that all 10,000 products have been AI-enriched, or that bulk AI automation was completed, is made.

## Exclusions

Do not attribute earlier Google Ads improvements to Peak PIM: the September meeting links them to the previous enrichment workflow. Do not invent revenue, conversion, hours saved, a plan, a conversion date, or multiple connected Shopify stores. Physical retail locations are not Shopify store connections. Requested features and planned team onboarding are not completed outcomes. Pricing, support issues, private contact information, referral conversations, and unrelated personal details remain outside the public story.

## Brand assets

Both source assets are from Unique Wholefood's [official About page](https://www.uniquewholefood.com.au/pages/about-us), downloaded on 2026-09-29. The store photo is encoded as WebP without changing its content; the logo was adapted as described below:

- Store photo: `https://www.uniquewholefood.com.au/cdn/shop/files/Shelf_1.png?v=1756785502&width=1200` → `public/assets/testimonials/unique-wholefood-store.webp`.
- Logo: `https://www.uniquewholefood.com.au/cdn/shop/files/logo-full-on-green-1200x630_ef6ef56f-9afe-416c-a3b3-d67a6b510ce9.png?v=1790304485&width=520` → `public/assets/customer-logos/unique-wholefood.webp`.

The photo is identified as a store interior, never as a portrait of Wayne.

The testimonial portrait was supplied and confirmed by the user: `/Users/theau/Desktop/1752073304610.png` → `public/assets/testimonials/wayne-choga.png` (copied unchanged). The public narrative names Unique Wholefood or its team; Wayne's name is reserved for the testimonial and its Review schema attribution.

On 2026-09-30, the user requested a transparent logo and removal of the company logo from the testimonial. The built-in image editor removed the solid rectangle, retained the lime emblem, and changed the white wordmark to dark forest green for contrast on light backgrounds. The resulting transparent PNG was losslessly encoded to `public/assets/customer-logos/unique-wholefood.webp`, shared by the hero, customer menu, and social image. The testimonial now shows only the quote, portrait, and attribution.

Logo editing prompt: “Edit the supplied Unique Wholefood logo asset for use on a cream-colored website. This is a precise logo adaptation, not a redesign. Remove the entire solid dark green rectangular background and make it truly transparent (alpha). Preserve the exact existing lime-green open circular sprout emblem on the left: identical shapes, proportions, stroke weight, leaf shapes and lime color. Preserve the exact existing two-line lowercase wordmark reading 'unique' on line one and 'wholefood' on line two, with exactly the same font, spelling, weight, spacing, positioning and proportions. Only change the currently white wordmark fill to the original background's dark forest green (#10352e approximately), so it reads clearly on a pale cream surface. No background, panel, border, shadow, texture or extra elements. Do not add or remove any letters, do not recreate the mark in a different font, do not use a checkerboard background. Output one crisp high-resolution logo on transparent alpha, wide landscape canvas with a tight and even transparent margin around the complete mark, no excessive empty padding. Keep the logo approximately 2:1 in aspect ratio.”
