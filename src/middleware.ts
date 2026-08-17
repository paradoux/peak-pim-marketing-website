import { defineMiddleware } from "astro:middleware";
import { defaultLocale, getLocaleFromPath } from "./i18n/config";
import { localizeHtml } from "./i18n/localize-html";

export const onRequest = defineMiddleware(async (context, next) => {
  const locale = getLocaleFromPath(context.originPathname);
  context.locals.locale = locale;
  context.locals.localizedPath = context.originPathname;

  const response = await next();
  if (locale === defaultLocale || response.headers.get("x-peak-localized") === locale) return response;

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) return response;

  const headers = new Headers(response.headers);
  headers.set("x-peak-localized", locale);
  headers.delete("content-length");
  return new Response(localizeHtml(await response.text(), locale), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
