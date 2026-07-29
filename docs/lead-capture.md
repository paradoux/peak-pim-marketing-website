# Lead capture modal

The lead capture system is rendered once by every shared site layout. It submits to the same-origin `/api/lead` Cloudflare Pages Function, which validates the request and forwards an approved payload to Make.com. The Make webhook URL never appears in browser code.

## Open the modal

Use the registered offer ID on any link or button:

```html
<a href="#" data-lead-modal="30-day-extended-trial">Get a 30-day trial</a>
```

It can also be opened from JavaScript:

```js
window.PeakLeadCapture.open("30-day-extended-trial");
```

For local review, append `?lead-modal=30-day-extended-trial` to any page URL.

## Add or change an offer

Offers, copy, success messages, and automatic trigger rules live in `src/data/lead-offers.ts`. Automatic opening requires both the configured delay and scroll depth. Rules can use separate mobile thresholds and page allowlists/exclusions. The current extended-trial offer opens after 60 seconds plus 55% scroll on eligible desktop pages, or after 85 seconds plus 65% scroll on mobile. It is frequency-capped for 14 days with local storage and permanently suppressed in that browser after a successful submission.

The automatic offer is limited to the homepage, feature, solution, and comparison pages. Pricing, legal, admin, and design-system routes are excluded. Manual CTA triggers always remain available.

## Environment variables

Browser build variable:

- `PUBLIC_TURNSTILE_SITE_KEY`: optional Cloudflare Turnstile site-key override for local or preview testing. The production site key is public and included in the modal component so direct Pages deployments cannot accidentally omit bot protection.

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
