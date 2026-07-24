const productionOrigin = "https://peak-pim.com";

export function canonicalUrl(path = "/") {
  const pathname = path === "/" || path === "" ? "/" : `/${path.replace(/^\/+|\/+$/g, "")}/`;
  return `${productionOrigin}${pathname}`;
}

export { productionOrigin };
