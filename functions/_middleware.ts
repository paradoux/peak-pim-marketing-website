type PagesContext = {
  request: Request;
  env: {
    ADMIN_USERNAME?: string;
    ADMIN_PASSWORD?: string;
  };
  next: () => Promise<Response>;
};

const noIndexHeaders = {
  "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet, noimageindex",
};

const productionHosts = new Set(["peak-pim.com", "www.peak-pim.com"]);

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
  const productionHost = isProductionHost(context.request);

  if (!productionHost && url.pathname === "/robots.txt") {
    return robotsTxt("User-agent: *\nDisallow: /\n");
  }

  if (!url.pathname.startsWith("/admin")) {
    const response = await context.next();

    return productionHost ? response : withNoIndex(response);
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
