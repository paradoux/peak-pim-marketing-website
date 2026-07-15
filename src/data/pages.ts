export type PageDefinition = {
  slug: string;
  source: string;
  title: string;
  description: string;
  h1: string;
};

export const pages: PageDefinition[] = [
  {
    slug: "",
    source: "index.html",
    title: "Peak PIM | Product Management for Shopify Merchants",
    description:
      "Manage, edit, and sync your product data across multiple Shopify stores from one place. Bulk editing, media management, and real-time sync.",
    h1: "One place for all your Shopify products",
  },
  {
    slug: "1-click-setup",
    source: "1-click-setup.html",
    title: "1-Click Setup | Connect Your Shopify Store to Peak PIM Instantly",
    description:
      "Set up your Shopify PIM in minutes, not weeks. Peak PIM extracts your entire catalog automatically — products, variants, collections, and metafields. No manual work required.",
    h1: "PIMs take weeks to set up. Peak PIM takes one click.",
  },
  {
    slug: "bulk-edit",
    source: "bulk-edit.html",
    title: "Bulk Edit Shopify Catalog & Metafields | Peak PIM",
    description:
      "Bulk edit products, variants, metafields, images, collections and SEO data across your entire Shopify catalog. No CSV. No limits. Built for multi-store merchants.",
    h1: "Edit your entire Shopify catalog in minutes",
  },
  {
    slug: "industry/fashion",
    source: "industry_fashion.html",
    title: "The Best PIM for Shopify Fashion Brands | Peak PIM",
    description:
      "Peak PIM is the Shopify-native PIM for fashion brands. Bulk edit variants, collections, size charts, and media across your catalog in minutes.",
    h1: "The Shopify PIM built for fashion brands",
  },
  {
    slug: "legals/privacy",
    source: "legals_privacy.html",
    title: "Privacy Policy | Peak PIM",
    description:
      "Read the Peak PIM privacy policy to understand how we collect, use, and protect data for Shopify merchants using our product information management app.",
    h1: "Privacy Policy",
  },
  {
    slug: "mission",
    source: "mission.html",
    title: "Our Mission | Peak PIM",
    description:
      "Peak PIM is fixing the missing piece in Shopify — product data management. One place to manage, enrich, and sync your entire catalog across every store.",
    h1: "We are on a mission",
  },
  {
    slug: "pricing",
    source: "pricing.html",
    title: "Peak PIM | Simple, Fair Pricing for Shopify Merchants",
    description:
      "Peak PIM pricing starts at $99/mo with free setup, a 10-day trial, and 2 months free annually. Core, Elite, and Enterprise plans for Shopify teams.",
    h1: "Simple pricing",
  },
  {
    slug: "replace-your-shopify-app-stack",
    source: "replace-your-shopify-app-stack.html",
    title: "Shopify PIM vs app stack: one tool instead of five (2026)",
    description:
      "Stop juggling 5 Shopify apps for product data. Peak PIM replaces Matrixify, Metafields Guru, bulk editors, and DAM tools with one Shopify-native PIM.",
    h1: "Replace your Shopify app stack with one PIM",
  },
  {
    slug: "shopify-media-management",
    source: "shopify-media-management.html",
    title: "Shopify Media Management — One Library for Every Store | Peak PIM",
    description:
      "Manage all your Shopify media from one place. Bulk edit file names and alt text, organize with folders and tags, track asset usage across stores.",
    h1: "Shopify media management that actually works",
  },
  {
    slug: "shopify-multi-store-pim",
    source: "shopify-multi-store-pim.html",
    title: "Shopify Multi-Store PIM — Manage All Your Stores in One Place | Peak PIM",
    description:
      "Peak PIM connects all your Shopify stores and keeps your product catalog in sync. Edit once, push everywhere. Bulk edit, shared media library, and metafield sync across every storefront.",
    h1: "One PIM for all your Shopify stores",
  },
  {
    slug: "shopify-pim-alternatives",
    source: "shopify-pim-alternatives.html",
    title: "Shopify PIM alternatives: compare the top tools (2026)",
    description:
      "Compare the top Shopify PIM alternatives including Akeneo, Plytix, Salsify, and Peak PIM. See pricing, features, and which one fits your Shopify catalog.",
    h1: "The complete guide to Shopify PIM alternatives",
  },
  {
    slug: "shopify-sync",
    source: "shopify-sync.html",
    title: "Shopify-Native PIM — Sync Products, Collections & Metafields | Peak PIM",
    description:
      "Peak PIM is a Shopify-native PIM. Import your full catalog in one click — products, collections, metafields, metaobjects, and files. Publish changes to Shopify when you're ready.",
    h1: "The first PIM built natively for Shopify",
  },
  {
    slug: "vs/akeneo",
    source: "vs_akeneo.html",
    title: "Peak PIM vs Akeneo: which Shopify PIM fits your catalog? (2026)",
    description:
      "Compare Peak PIM and Akeneo side by side. Pricing ($99/mo vs $25K+/yr), setup time, Shopify-native integration, multi-store sync, and which tool fits Shopify-first brands.",
    h1: "Peak PIM beats Akeneo for Shopify-first brands",
  },
  {
    slug: "vs/catsy",
    source: "vs_catsy.html",
    title: "Peak PIM vs Catsy: which Shopify PIM fits your catalog? (2026)",
    description:
      "Compare Peak PIM and Catsy side by side. Pricing, setup time, Shopify-native integration, syndication features, and which tool fits Shopify-first brands.",
    h1: "Peak PIM beats Catsy for Shopify-first brands",
  },
  {
    slug: "vs/plytix",
    source: "vs_plytix.html",
    title: "Peak PIM vs Plytix: which Shopify PIM fits your catalog? (2026)",
    description:
      "Compare Peak PIM and Plytix side by side. Pricing ($99/mo vs $499/mo), setup time, Shopify-native integration, multi-store sync, metafields support, and which tool fits Shopify-first brands.",
    h1: "Peak PIM beats Plytix for Shopify-first brands",
  },
  {
    slug: "vs/quable",
    source: "vs_quable.html",
    title: "Peak PIM vs Quable: which Shopify PIM fits your catalog? (2026)",
    description:
      "Compare Peak PIM and Quable side by side. Pricing, setup time, Shopify-native integration, multi-store sync, and which tool fits Shopify-first brands.",
    h1: "Peak PIM beats Quable for Shopify-first brands",
  },
  {
    slug: "vs/shopify-admin",
    source: "vs_shopify-admin.html",
    title: "Shopify admin vs PIM: when to add Peak PIM (2026)",
    description:
      "Shopify admin works for small catalogs. At hundreds of products with metafields, media, and multiple stores, you need a Shopify PIM. See when Peak PIM helps.",
    h1: "Peak PIM extends Shopify admin for catalogs at scale",
  },
];

export const pageSlugs = pages.map((page) => page.slug);

export const pagesBySlug = new Map(pages.map((page) => [page.slug, page]));
