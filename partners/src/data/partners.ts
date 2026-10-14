import { assets } from "../../../src/data/assets";

export type PartnerBrief = {
  slug: string;
  name: string;
  logo?: string;
  title: string;
  description: string;
};

export const hub: PartnerBrief = {
  slug: "",
  name: "Shopify agencies",
  title: "Better catalog operations for your Shopify clients",
  description: "Bring Peak PIM into your Shopify projects. Give clients a better way to manage their products, turn setup into a service, and build recurring revenue together.",
};

export const partners: PartnerBrief[] = [
  {
    slug: "axome",
    name: "Axome",
    logo: assets.partnerLogos.axome,
    title: "Better catalog operations for Axome’s clients",
    description: "Bring Peak PIM into your Shopify projects. Give clients a better way to manage their products, turn setup into a service, and build recurring revenue together.",
  },
];

const slugs = new Set<string>();
for (const partner of partners) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(partner.slug) || ["404", "index"].includes(partner.slug) || slugs.has(partner.slug)) {
    throw new Error(`Invalid or duplicate partner slug: ${partner.slug}`);
  }
  slugs.add(partner.slug);
}
