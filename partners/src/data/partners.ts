export type PartnerBrief = {
  slug: string;
  name: string;
  title: string;
  description: string;
  audience: string;
  fitTitle: string;
  fitDescription: string;
  collaborationTitle: string;
  collaborationDescription: string;
  partnerRole: string;
  nextStep: string;
};

export const hub: PartnerBrief = {
  slug: "",
  name: "Shopify partners",
  title: "Better catalog operations for your Shopify clients",
  description: "Peak PIM brings product information, enrichment, and publishing into one Shopify-native workspace. Help merchants manage complex catalogs without repeating every update across tools and stores.",
  audience: "For Shopify agencies, consultants, and ecosystem teams",
  fitTitle: "Know when to bring Peak into the conversation",
  fitDescription: "Start with a merchant's catalog workflow. These are three situations where a dedicated product information workspace can help.",
  collaborationTitle: "A clear way to work together",
  collaborationDescription: "Start with one merchant and a real use case. Agree the scope and responsibilities together before making commitments.",
  partnerRole: "Bring the merchant context: their stores, catalog challenges, existing tools, and project goals. Help identify where Peak fits into the wider Shopify project.",
  nextStep: "Bring a catalog challenge. We’ll walk through it together.",
};

// One record creates one shareable route. These pages describe a proposed way
// to collaborate; they do not imply an endorsement or agreed commercial terms.
export const partners: PartnerBrief[] = [
  {
    slug: "axome",
    name: "Axome",
    title: "A Shopify PIM for Axome’s next project",
    description: "Give your Shopify clients one place to manage product content, enrich their catalog, and publish across stores. Peak PIM supports the catalog work behind a launch and the daily operations that follow.",
    audience: "Partner briefing · Prepared for Axome",
    fitTitle: "Where Peak could fit into an Axome project",
    fitDescription: "A new storefront is only part of the project. Peak helps when the merchant also needs a better way to prepare and maintain product information.",
    collaborationTitle: "From a client brief to a shared plan",
    collaborationDescription: "A proposed starting point for working with Axome. We confirm the fit, delivery scope, and responsibilities for each client together.",
    partnerRole: "Axome brings the client context and Shopify project requirements. Together, we identify the catalog workflows, store structure, and handover needs to cover.",
    nextStep: "Let’s look at one of your client projects",
  },
];

const slugs = new Set<string>();
for (const partner of partners) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(partner.slug) || ["404", "index"].includes(partner.slug) || slugs.has(partner.slug)) {
    throw new Error(`Invalid or duplicate partner slug: ${partner.slug}`);
  }
  slugs.add(partner.slug);
}
