type PagesContext = {
  request: Request;
  env: {
    ADMIN_USERNAME?: string;
    ADMIN_PASSWORD?: string;
    CF_PAGES_COMMIT_SHA?: string;
  };
  next: () => Promise<Response>;
  waitUntil: (promise: Promise<unknown>) => void;
};

const noIndexHeaders = {
  "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet, noimageindex",
};

const productionHosts = new Set(["peak-pim.com", "www.peak-pim.com"]);
const browserPageCacheControl = "public, max-age=0, must-revalidate";
const edgePageCacheControl = "public, max-age=0, must-revalidate, s-maxage=86400";

function isProductionHost(request: Request) {
  return productionHosts.has(new URL(request.url).hostname);
}

function robotsTxt(body: string) {
  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      ...noIndexHeaders,
    },
  });
}

function withNoIndex(response: Response) {
  const protectedResponse = new Response(response.body, response);

  Object.entries(noIndexHeaders).forEach(([key, value]) => {
    protectedResponse.headers.set(key, value);
  });

  return protectedResponse;
}

function notFound() {
  return new Response("Not found.", {
    status: 404,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      ...noIndexHeaders,
    },
  });
}

function isContentDetailPath(pathname: string) {
  return /^\/(?:blog|guides)\/[^/]+\/?$/.test(pathname);
}

function isCacheablePublicPage(request: Request) {
  const url = new URL(request.url);
  const lastPathSegment = url.pathname.split("/").pop() ?? "";
  const hasFileExtension = /\.[a-z0-9]+$/i.test(lastPathSegment);

  return request.method === "GET"
    && !hasFileExtension
    && !url.pathname.startsWith("/admin")
    && !url.pathname.startsWith("/api/");
}

function publicPageCacheKey(request: Request, deployment: string) {
  const url = new URL(request.url);
  url.searchParams.set("__peak_deployment", deployment);
  return new Request(url.toString(), { method: "GET" });
}

function servedPublicPage(response: Response) {
  const servedResponse = new Response(response.body, response);
  servedResponse.headers.set("Cache-Control", browserPageCacheControl);
  servedResponse.headers.delete("Cache-Tag");
  return servedResponse;
}

async function cachedPublicPage(context: PagesContext, url: URL, productionHost: boolean) {
  const deployment = context.env.CF_PAGES_COMMIT_SHA ?? "current";
  const cacheKey = publicPageCacheKey(context.request, deployment);
  const cache = caches.default;
  const cached = await cache.match(cacheKey);

  if (cached) {
    return servedPublicPage(cached);
  }

  const response = await context.next();
  const contentResponse = isContentDetailPath(url.pathname)
    ? await protectMissingContentDetail(response)
    : response;
  const contentType = contentResponse.headers.get("content-type") ?? "";

  if (contentResponse.status !== 200 || !contentType.includes("text/html")) {
    return contentResponse;
  }

  const publicResponse = productionHost ? contentResponse : withNoIndex(contentResponse);
  const cacheableResponse = new Response(publicResponse.body, publicResponse);
  cacheableResponse.headers.set("Cache-Control", edgePageCacheControl);
  cacheableResponse.headers.set("Cache-Tag", `peak-pages-${deployment}`);
  context.waitUntil(cache.put(cacheKey, cacheableResponse.clone()));

  return servedPublicPage(cacheableResponse);
}

async function protectMissingContentDetail(response: Response) {
  if (response.status !== 200) {
    return response;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("text/html")) {
    return response;
  }

  const body = await response.text();

  if (!body.includes('name="peak-content-entry"')) {
    return notFound();
  }

  return new Response(body, response);
}

function unauthorized() {
  return new Response("Authentication required.", {
    status: 401,
    headers: {
      ...noIndexHeaders,
      "WWW-Authenticate": 'Basic realm="Peak PIM Admin", charset="UTF-8"',
    },
  });
}

function textEquals(left: string, right: string) {
  const encoder = new TextEncoder();
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);

  if (leftBytes.length !== rightBytes.length) {
    return false;
  }

  return leftBytes.every((byte, index) => byte === rightBytes[index]);
}

function parseBasicAuth(header: string | null) {
  if (!header?.startsWith("Basic ")) {
    return null;
  }

  try {
    const decoded = atob(header.slice("Basic ".length));
    const separator = decoded.indexOf(":");

    if (separator === -1) {
      return null;
    }

    return {
      username: decoded.slice(0, separator),
      password: decoded.slice(separator + 1),
    };
  } catch {
    return null;
  }
}

export const onRequest = async (context: PagesContext) => {
  const url = new URL(context.request.url);

  if (url.hostname === "www.peak-pim.com") {
    url.protocol = "https:";
    url.hostname = "peak-pim.com";
    url.port = "";
    return Response.redirect(url.toString(), 301);
  }

  const productionHost = isProductionHost(context.request);

  if (!productionHost && url.pathname === "/robots.txt") {
    return robotsTxt("User-agent: *\nDisallow: /\n");
  }

  if (!url.pathname.startsWith("/admin")) {
    if (isCacheablePublicPage(context.request)) {
      return cachedPublicPage(context, url, productionHost);
    }

    const response = await context.next();
    const contentResponse = isContentDetailPath(url.pathname)
      ? await protectMissingContentDetail(response)
      : response;

    return productionHost ? contentResponse : withNoIndex(contentResponse);
  }

  const username = context.env.ADMIN_USERNAME ?? "theau";
  const password = context.env.ADMIN_PASSWORD;

  if (!password) {
    return new Response("ADMIN_PASSWORD is not configured.", {
      status: 503,
      headers: noIndexHeaders,
    });
  }

  const credentials = parseBasicAuth(context.request.headers.get("Authorization"));

  if (
    !credentials ||
    !textEquals(credentials.username, username) ||
    !textEquals(credentials.password, password)
  ) {
    return unauthorized();
  }

  const response = await context.next();
  return withNoIndex(response);
};
