export type SiteNavigationLink = {
  label: string;
  href: string;
  description?: string;
  external?: boolean;
  crisp?: boolean;
};

export type FeatureNavigationGroup = {
  label: string;
  description: string;
  links: SiteNavigationLink[];
};

export const featureNavigationGroups: FeatureNavigationGroup[] = [
  {
    label: "Connect",
    description: "Bring Shopify and the tools around it into one catalog.",
    links: [
      { label: "1-click setup", href: "/1-click-setup", description: "Connect a Shopify store in minutes." },
      { label: "Shopify sync", href: "/shopify-sync", description: "Keep every catalog change flowing to Shopify." },
      { label: "AI Connector", href: "/ai-catalog-connector", description: "Work with your catalog from AI assistants." },
      { label: "Developer API", href: "/api", description: "Build custom catalog workflows and integrations." },
    ],
  },
  {
    label: "Operate",
    description: "Run day-to-day catalog work from one operational hub.",
    links: [
      { label: "Multi-store", href: "/shopify-multi-store-pim", description: "Control every store from one catalog." },
      { label: "Bulk edit", href: "/bulk-edit", description: "Change thousands of records at once." },
      { label: "Import & export", href: "/shopify-product-import-export", description: "Move spreadsheet data in and out safely." },
      { label: "Media management", href: "/shopify-media-management", description: "Organize product media in one library." },
      { label: "Drops", href: "/shopify-product-drops", description: "Schedule changes and automatic rollbacks." },
      { label: "Health Center", href: "/shopify-catalog-health-center", description: "Find catalog issues before customers do." },
      { label: "Users & permissions", href: "/user-roles-permissions", description: "Give each teammate the right access." },
    ],
  },
  {
    label: "Manage & Enrich",
    description: "Turn product data into complete, localized content.",
    links: [
      { label: "Products & variants", href: "/shopify-product-management", description: "Manage the core catalog and every store version." },
      { label: "Collections", href: "/shopify-collections", description: "Manage collection content and memberships across stores." },
      { label: "Metafields", href: "/shopify-metafield-management", description: "Define and publish typed Shopify data across stores." },
      { label: "Metaobjects", href: "/shopify-metaobjects", description: "Structure custom content once and reuse it." },
      { label: "Translations", href: "/shopify-pim-translations", description: "Manage every locale beside the source." },
      { label: "Markets & catalogs", href: "/shopify-markets-pricing", description: "Manage international product availability and pricing." },
      { label: "Custom fields", href: "/shopify-custom-fields", description: "Manage synced metafields and private PIM fields." },
    ],
  },
  {
    label: "Solutions",
    description: "See how Peak PIM supports specific commerce teams and industries.",
    links: [
      { label: "Fashion", href: "/industry/fashion", description: "Manage variants, collections, media, and size data." },
    ],
  },
];

export const exploreNavigationLinks: SiteNavigationLink[] = [
  { label: "Pricing", href: "/pricing/" },
  { label: "Help Center", href: "https://help.peak-pim.com/en/", external: true },
  { label: "Product updates", href: "https://www.linkedin.com/company/peak-pim/posts/", external: true },
  { label: "Mission", href: "/mission" },
  { label: "Contact", href: "#", crisp: true },
];

export const comparisonNavigationLinks: SiteNavigationLink[] = [
  { label: "Build vs buy a PIM", href: "/build-vs-buy-pim/" },
  { label: "PIM alternatives", href: "/shopify-pim-alternatives" },
  { label: "Peak vs Akeneo", href: "/vs/akeneo" },
  { label: "Peak vs Plytix", href: "/vs/plytix" },
  { label: "Peak vs Catsy", href: "/vs/catsy" },
  { label: "Peak vs Quable", href: "/vs/quable" },
  { label: "Peak vs Shopify Apps", href: "/replace-your-shopify-app-stack" },
  { label: "Peak vs Shopify Admin", href: "/vs/shopify-admin" },
];

export const communityNavigationLinks: SiteNavigationLink[] = [
  { label: "Shopify App", href: "https://apps.shopify.com/peak-pim", external: true },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/peak-pim/", external: true },
  { label: "X / Twitter", href: "https://x.com/peak_pim", external: true },
  { label: "YouTube", href: "https://www.youtube.com/@peak-pim", external: true },
  { label: "Google Reviews", href: "https://share.google/gj5Ju0RrU4EGvE4HS", external: true },
  { label: "Reddit", href: "https://www.reddit.com/user/peak-pim/", external: true },
];
