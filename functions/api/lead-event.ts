import { isLeadOfferId } from "../../src/data/lead-offers";

type D1Result<T> = {
  results?: T[];
};

type D1Statement = {
  bind: (...values: unknown[]) => D1Statement;
  run: () => Promise<D1Result<unknown>>;
};

type D1Database = {
  prepare: (query: string) => D1Statement;
};

type Env = {
  LEAD_ANALYTICS?: D1Database;
};

type PagesContext = {
  request: Request;
  env: Env;
};

const allowedEvents = new Set(["modal_view", "modal_dismiss", "modal_submit"]);
const allowedTriggers = new Set(["automatic", "manual", "query"]);
const allowedDevices = new Set(["desktop", "mobile"]);
const MAX_REQUEST_BYTES = 8_192;

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export const onRequestPost = async ({ request, env }: PagesContext) => {
  if (!sameOrigin(request)) {
    return json({ ok: false }, 403);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return json({ ok: false }, 413);
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false }, 400);
  }

  const eventType = text(body.eventType, 40);
  const offerId = text(body.offerId, 80);
  const triggerType = text(body.triggerType, 20);
  const deviceType = text(body.deviceType, 20);

  if (
    !allowedEvents.has(eventType) ||
    !isLeadOfferId(offerId) ||
    !allowedTriggers.has(triggerType) ||
    !allowedDevices.has(deviceType)
  ) {
    return json({ ok: false }, 400);
  }

  if (!env.LEAD_ANALYTICS) {
    return json({ ok: false }, 503);
  }

  const pagePath = text(body.pagePath, 500) || "/";
  const referrerHost = text(body.referrerHost, 255);
  const sessionId = text(body.sessionId, 100);
  const utmSource = text(body.utmSource, 200);
  const utmMedium = text(body.utmMedium, 200);
  const utmCampaign = text(body.utmCampaign, 200);

  try {
    await env.LEAD_ANALYTICS.prepare(
      `INSERT INTO lead_modal_events (
        event_type,
        offer_id,
        trigger_type,
        device_type,
        page_path,
        referrer_host,
        session_id,
        utm_source,
        utm_medium,
        utm_campaign
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        eventType,
        offerId,
        triggerType,
        deviceType,
        pagePath,
        referrerHost,
        sessionId,
        utmSource,
        utmMedium,
        utmCampaign,
      )
      .run();
  } catch {
    return json({ ok: false }, 500);
  }

  return new Response(null, { status: 204 });
};

export const onRequestGet = async () => json({ ok: false }, 405);
