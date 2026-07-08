import { pagesBySlug, type PageDefinition } from "../data/pages";

const pageModules = import.meta.glob<string>("../content/recreated-pages/*.html", {
  eager: true,
  query: "?raw",
  import: "default",
});

const homeHtml = pageModules["../content/recreated-pages/index.html"];

function firstMatch(html: string, pattern: RegExp) {
  return html.match(pattern)?.[0] ?? "";
}

function innerMatch(html: string, pattern: RegExp) {
  return html.match(pattern)?.[1] ?? "";
}

const sharedHeaderHtml = firstMatch(
  homeHtml,
  /<div data-animation="default" class="navbar12_component[\s\S]*?<main class="main-wrapper">/,
).replace(/<main class="main-wrapper">$/, "");

const sharedGlobalStylesHtml = firstMatch(homeHtml, /<div class="global-styles">[\s\S]*?<\/div><\/div>/);

const sharedFooterHtml = firstMatch(homeHtml, /<footer class="footer1_component"[\s\S]*?<\/footer>/);

export function getPage(slug = "") {
  return pagesBySlug.get(slug);
}

export function getPageDocument(page: PageDefinition) {
  const html = pageModules[`../content/recreated-pages/${page.source}`];

  if (!html) {
    throw new Error(`Missing recreated page source: ${page.source}`);
  }

  return {
    html,
    headHtml: cleanHead(innerMatch(html, /<head[^>]*>([\s\S]*?)<\/head>/i)),
    mainHtml: extractMain(html),
    htmlClass: innerMatch(html, /<html[^>]*class="([^"]*)"/i),
    wfPage: innerMatch(html, /<html[^>]*data-wf-page="([^"]*)"/i),
    wfSite: innerMatch(html, /<html[^>]*data-wf-site="([^"]*)"/i),
  };
}

export function getSharedHeaderHtml() {
  return sharedHeaderHtml;
}

export function getSharedGlobalStylesHtml() {
  return sharedGlobalStylesHtml;
}

export function getSharedFooterHtml() {
  return sharedFooterHtml;
}

function extractMain(html: string) {
  const main = firstMatch(html, /<main class="main-wrapper">[\s\S]*?<\/main>/);

  if (!main) {
    return innerMatch(html, /<body[^>]*>([\s\S]*?)<\/body>/i)
      .replace(sharedHeaderHtml, "")
      .replace(sharedFooterHtml, "");
  }

  return main;
}

function cleanHead(headHtml: string) {
  return headHtml
    .replace(/<style>html\{font-family:[\s\S]*?<\/style>/, "")
    .replace(/<link href="\/mirror\/local-fonts\.css" rel="stylesheet" type="text\/css">/, "");
}
