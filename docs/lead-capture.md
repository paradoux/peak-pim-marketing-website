# Demo prompt and legacy lead capture

The shared `DemoBookingModal.astro` replaces the 30-day trial email form with “See Peak with your own data” and the existing Google booking calendar. Every shared layout renders a single booking dialog; its calendar loads only when opened.

## Open the modal

Use the shared booking CTA:

```html
<a href="/book-a-demo/" data-demo-booking>Book a demo</a>
```

Existing `?lead-modal=30-day-extended-trial` links and `data-lead-modal="30-day-extended-trial"` triggers now open the booking flow. On the dedicated booking page, they focus the inline calendar.

## Automatic prompt

Rules live in `demoAutoOpen` in `src/data/cta-copy.ts`. On eligible English pages, opening requires 60 seconds plus 55% scroll on desktop, or 85 seconds plus 65% scroll on mobile. The homepage, selected feature, solution, comparison, and customer pages retain their previous eligibility. Pricing, legal, admin, design-system, and dedicated booking pages do not open automatically. Localized pages retain their manual translated booking modal.

Any booking modal opening starts a 14-day cooldown in local storage. A manual opening also prevents another automatic prompt on the same page. Previous trial-popup cooldowns and successful submissions remain respected. Other open dialogs are never interrupted.

## Retained trial infrastructure

The historical offer definition in `src/data/lead-offers.ts`, `/api/lead`, `/api/lead-event`, and admin reports remain available for existing integrations and historical data. The website no longer renders the email form, loads its Turnstile widget, or sends trial-modal events. Google Calendar bookings are not reported as trial submissions.

The following configuration documents the retained legacy endpoints.

## Environment variables

Cloudflare Pages Function secrets:

- `MAKE_LEAD_WEBHOOK_URL`: required Make custom webhook URL.
- `MAKE_WEBHOOK_API_KEY`: optional Make custom webhook API key.
- `TURNSTILE_SECRET_KEY`: Turnstile secret. When configured, the endpoint rejects requests without a valid token.

Configure all Function values as encrypted secrets. Turnstile secret keys and Make webhook values must never be committed. Turnstile site keys are intentionally browser-visible and are not secrets.

Cloudflare binding:

- `LEAD_ANALYTICS`: D1 database used for aggregate modal events. The production database is EU-jurisdiction restricted.

## Admin analytics

The protected `/admin` page reports modal views, dismissals, successful trial requests, conversion rate, daily activity, device and trigger breakdowns, and source-page performance for 7, 30, or 90 days.

The browser submits only the event type, offer, trigger, device category, page path, referrer host, session-scoped random ID, and UTM attribution. It does not send the lead email to the analytics endpoint. Lead emails continue to flow only through `/api/lead` to Make.

## Make scenario

Recommended flow:

1. Custom Webhook receives `lead_capture.submitted`.
2. Deduplicate by `email` and `offer` if the resource should only be sent once.
3. Send the activation steps for the extended trial through the selected email provider.
4. Post the trial request to Discord. Use Discord's `thread_id` when targeting a specific thread.
5. Add an error handler and retry path for email or Discord delivery failures.

The website only confirms that Make accepted the webhook. Downstream email and Discord delivery should be monitored in Make.

## Payload

The webhook receives the normalized email, offer ID, page context, UTM values, submission time, and a request ID suitable for deduplication and troubleshooting.
