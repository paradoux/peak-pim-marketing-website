import { isLeadOfferId } from "../../src/data/lead-offers";

type Env = {
  MAKE_LEAD_WEBHOOK_URL?: string;
  MAKE_WEBHOOK_API_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
};

type PagesContext = {
  request: Request;
  env: Env;
};

type LeadRequest = {
  email?: unknown;
  firstName?: unknown;
  offer?: unknown;
  website?: unknown;
  turnstileToken?: unknown;
  pageUrl?: unknown;
  pageTitle?: unknown;
  referrer?: unknown;
  utmSource?: unknown;
  utmMedium?: unknown;
  utmCampaign?: unknown;
  utmContent?: unknown;
  requestId?: unknown;
};

const MAX_REQUEST_BYTES = 16_384;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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

async function verifyTurnstile(secret: string, token: string, request: Request) {
  if (!token) return false;

  const form = new FormData();
  form.set("secret", secret);
  form.set("response", token);
  const remoteIp = request.headers.get("CF-Connecting-IP");
  if (remoteIp) form.set("remoteip", remoteIp);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  });
  if (!response.ok) return false;

  const result = (await response.json()) as {
    success?: boolean;
    action?: string;
    hostname?: string;
  };
  if (result.success !== true || (result.action && result.action !== "lead_capture")) {
    return false;
  }

  const requestHostname = new URL(request.url).hostname;
  const productionHostnames = new Set([
    "peak-pim.com",
    "www.peak-pim.com",
    "staging.peak-pim.com",
  ]);

  return !productionHostnames.has(requestHostname) || result.hostname === requestHostname;
}

export const onRequestPost = async ({ request, env }: PagesContext) => {
  if (!sameOrigin(request)) {
    return json({ ok: false, message: "This submission is not allowed." }, 403);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return json({ ok: false, message: "This submission is too large." }, 413);
  }

  let body: LeadRequest;
  try {
    body = (await request.json()) as LeadRequest;
  } catch {
    return json({ ok: false, message: "The form submission is invalid." }, 400);
  }

  if (text(body.website, 200)) {
    return json({ ok: true });
  }

  const email = text(body.email, 254).toLowerCase();
  const offer = text(body.offer, 80);
  if (!EMAIL_PATTERN.test(email)) {
    return json({ ok: false, message: "Enter a valid email address." }, 400);
  }
  if (!isLeadOfferId(offer)) {
    return json({ ok: false, message: "This offer is not available." }, 400);
  }

  if (env.TURNSTILE_SECRET_KEY) {
    const turnstileValid = await verifyTurnstile(
      env.TURNSTILE_SECRET_KEY,
      text(body.turnstileToken, 2048),
      request,
    ).catch(() => false);

    if (!turnstileValid) {
      return json({ ok: false, message: "Complete the security check and try again." }, 400);
    }
  }

  if (!env.MAKE_LEAD_WEBHOOK_URL) {
    return json({ ok: false, message: "Email capture is not configured yet." }, 503);
  }

  let webhookUrl: URL;
  try {
    webhookUrl = new URL(env.MAKE_LEAD_WEBHOOK_URL);
    if (webhookUrl.protocol !== "https:") throw new Error("Webhook must use HTTPS");
  } catch {
    return json({ ok: false, message: "Email capture is not configured correctly." }, 503);
  }

  const requestId = text(body.requestId, 100) || crypto.randomUUID();
  const webhookPayload = {
    event: "lead_capture.submitted",
    version: 1,
    requestId,
    email,
    firstName: text(body.firstName, 80),
    offer,
    source: "website_modal",
    pageUrl: text(body.pageUrl, 2048),
    pageTitle: text(body.pageTitle, 200),
    referrer: text(body.referrer, 2048),
    utmSource: text(body.utmSource, 200),
    utmMedium: text(body.utmMedium, 200),
    utmCampaign: text(body.utmCampaign, 200),
    utmContent: text(body.utmContent, 200),
    submittedAt: new Date().toISOString(),
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const headers = new Headers({
      "content-type": "application/json",
      accept: "application/json, text/plain, */*",
    });
    if (env.MAKE_WEBHOOK_API_KEY) {
      headers.set("x-make-apikey", env.MAKE_WEBHOOK_API_KEY);
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(webhookPayload),
      signal: controller.signal,
    });

    if (!response.ok) {
      return json({ ok: false, message: "We could not send your request. Please try again." }, 502);
    }
  } catch {
    return json({ ok: false, message: "We could not send your request. Please try again." }, 502);
  } finally {
    clearTimeout(timeout);
  }

  return json({ ok: true, requestId });
};

export const onRequestGet = async () => json({ ok: false, message: "Method not allowed." }, 405);
