export type PricingPlanValue = boolean | string;

export type PricingFeature = {
  label: string;
  description: string;
  href?: string;
  badge?: "New";
  values: [PricingPlanValue, PricingPlanValue, PricingPlanValue, PricingPlanValue];
};

export type PricingPlan = {
  name: "Basic" | "Core" | "Elite" | "Enterprise";
  monthlyPrice: string;
  annualPrice: string;
  summary: string;
  highlights: [string, string, string];
  ctaLabel: string;
  ctaHref: string;
};

export const pricingPlans: PricingPlan[] = [
  {
    name: "Basic",
    monthlyPrice: "$49",
    annualPrice: "$490",
    summary: "For single-store merchants ready to run catalog work from one place.",
    highlights: ["1 store", "2,000 updates/mo", "1 Drop/mo"],
    ctaLabel: "Get Peak PIM",
    ctaHref: "https://apps.shopify.com/peak-pim",
  },
  {
    name: "Core",
    monthlyPrice: "$99",
    annualPrice: "$990",
    summary: "For lean teams managing more catalog activity and a second store.",
    highlights: ["2 stores", "10,000 updates/mo", "2 Drops/mo"],
    ctaLabel: "Get Peak PIM",
    ctaHref: "https://apps.shopify.com/peak-pim",
  },
  {
    name: "Elite",
    monthlyPrice: "$249",
    annualPrice: "$2,490",
    summary: "For growing teams that need unlimited updates and advanced workflows.",
    highlights: ["3 stores", "Unlimited updates", "Unlimited Drops"],
    ctaLabel: "Get Peak PIM",
    ctaHref: "https://apps.shopify.com/peak-pim",
  },
  {
    name: "Enterprise",
    monthlyPrice: "Custom",
    annualPrice: "Custom",
    summary: "For larger operations with custom limits, data models, and support.",
    highlights: ["Custom stores", "Complex data", "Dedicated support"],
    ctaLabel: "Contact us",
    ctaHref: "https://calendar.app.google/M9DEEDbc6AxRaNNX6",
  },
];

export type PricingFeatureGroup = {
  label: string;
  description: string;
  features: PricingFeature[];
};

export const pricingFeatureGroups: PricingFeatureGroup[] = [
  {
    label: "Plan limits",
    description: "The store, team, and monthly usage included in each plan.",
    features: [
      {
        label: "Connected Shopify stores",
        description: "The number of Shopify stores you can connect and manage from the same Peak PIM account.",
        href: "/shopify-multi-store-pim",
        values: ["1", "2", "3", "Custom"],
      },
      {
        label: "Seats",
        description: "The number of teammates who can access your Peak PIM account.",
        href: "/user-roles-permissions",
        values: ["1", "3", "15", "Custom"],
      },
      {
        label: "Monthly updates",
        description: "An update is one saved record in Peak PIM or one synchronization to a connected store. Bulk actions count the records they update.",
        values: ["2,000", "10,000", "Unlimited", "Custom"],
      },
      {
        label: "SKUs",
        description: "Products and variants are not restricted by a fixed SKU cap on self-serve plans. A fair-use policy protects platform performance.",
        href: "/shopify-product-management",
        values: ["Unlimited, fair usage", "Unlimited, fair usage", "Unlimited, fair usage", "Custom"],
      },
      {
        label: "File storage",
        description: "Product images, videos, and files are covered by fair usage on self-serve plans, without a fixed storage allowance.",
        href: "/shopify-media-management",
        values: ["Unlimited, fair usage", "Unlimited, fair usage", "Unlimited, fair usage", "Custom"],
      },
    ],
  },
  {
    label: "Connect",
    description: "Bring Shopify and the tools around it into one catalog.",
    features: [
      {
        label: "1-click setup",
        description: "Connect a Shopify store and bring its catalog into Peak PIM without a migration project.",
        href: "/1-click-setup",
        values: [true, true, true, true],
      },
      {
        label: "Shopify sync",
        description: "Refresh catalog data from Shopify and publish approved changes back to the right store.",
        href: "/shopify-sync",
        values: [true, true, true, true],
      },
      {
        label: "Amazon sync",
        description: "Synchronize catalog data with Amazon marketplaces from Peak PIM. This feature is coming soon.",
        values: ["Coming soon", "Coming soon", "Coming soon", "Coming soon"],
      },
      {
        label: "AI Connector (MCP)",
        description: "Connect MCP-compatible AI assistants to controlled catalog search and draft workflows.",
        href: "/ai-catalog-connector",
        badge: "New",
        values: [true, true, true, true],
      },
      {
        label: "API",
        description: "Build custom integrations and catalog workflows on top of Peak PIM.",
        href: "/api",
        values: [true, true, true, true],
      },
    ],
  },
  {
    label: "Operate",
    description: "Run day-to-day catalog work from one operational hub.",
    features: [
      {
        label: "AI Assistant",
        description: "Use your own Anthropic or OpenAI API key to ask about the catalog, approve proposed drafts, and confirm every publish separately.",
        href: "/ai-assistant",
        badge: "New",
        values: [true, true, true, true],
      },
      {
        label: "Multi-store management",
        description: "Review and update store-specific product data from one shared catalog.",
        href: "/shopify-multi-store-pim",
        values: [false, true, true, true],
      },
      {
        label: "Bulk edit",
        description: "Filter, select, and update products, variants, collections, and metafields at catalog scale.",
        href: "/bulk-edit",
        values: [true, true, true, true],
      },
      {
        label: "Import & export",
        description: "Move spreadsheet data in and out with mapping, matching, validation, and a full preview before saving.",
        href: "/shopify-product-import-export",
        values: [true, true, true, true],
      },
      {
        label: "Media management",
        description: "Organize product media once and manage its use across products, variants, and stores.",
        href: "/shopify-media-management",
        values: [true, true, true, true],
      },
      {
        label: "Drops",
        description: "Schedule product and price changes, publish them at the right time, and restore captured values automatically.",
        href: "/shopify-product-drops",
        badge: "New",
        values: ["1 per month", "2 per month", "Unlimited", "Unlimited"],
      },
      {
        label: "Automations",
        description: "Build repeatable rules that run catalog workflows automatically. This feature is coming soon.",
        values: ["Coming soon", "Coming soon", "Coming soon", "Coming soon"],
      },
      {
        label: "Scores",
        description: "Measure catalog quality with built-in SEO, LLM readiness, and custom scores. This feature is coming soon.",
        values: ["Coming soon", "Coming soon", "Coming soon", "Coming soon"],
      },
      {
        label: "History",
        description: "Track every saved edit and published store change with its author, source, timestamp, and field-level before and after.",
        href: "/history",
        badge: "New",
        values: [false, true, true, true],
      },
      {
        label: "Backups",
        description: "Restore catalog data to an earlier point when something goes wrong. This feature is coming soon.",
        values: ["Coming soon", "Coming soon", "Coming soon", "Coming soon"],
      },
      {
        label: "Global search",
        description: "Find products, variants, SKUs, media, definitions, store content, and app pages from one account-wide command palette.",
        href: "/search",
        badge: "New",
        values: [true, true, true, true],
      },
      {
        label: "Health Center",
        description: "Run catalog checks, inspect issues, fix the affected records, and confirm the result.",
        href: "/shopify-catalog-health-center",
        badge: "New",
        values: ["1 scan per month", "Unlimited", "Unlimited", "Unlimited"],
      },
      {
        label: "Users & permissions",
        description: "Control team access with roles, permissions, and store scope.",
        href: "/user-roles-permissions",
        values: [false, "Standard", "Standard", "Advanced"],
      },
    ],
  },
  {
    label: "Manage & Enrich",
    description: "Turn product data into complete, localized content.",
    features: [
      {
        label: "Products & variants",
        description: "Manage the core catalog, variant structure, and intentional differences between stores.",
        href: "/shopify-product-management",
        values: [true, true, true, true],
      },
      {
        label: "Collections",
        description: "Manage collection content, product membership, SEO, and store versions from one place.",
        href: "/shopify-collections",
        values: [true, true, true, true],
      },
      {
        label: "Metafields",
        description: "Define, edit, validate, and publish typed Shopify metafields across stores.",
        href: "/shopify-metafield-management",
        values: [true, true, true, true],
      },
      {
        label: "Metaobjects",
        description: "Create reusable structured content such as size guides, care instructions, and designer profiles.",
        href: "/shopify-metaobjects",
        values: [false, false, false, true],
      },
      {
        label: "Translations",
        description: "Keep localized product content beside its source and publish each language to the right store.",
        href: "/shopify-pim-translations",
        values: [false, false, false, true],
      },
      {
        label: "Markets & catalogs",
        description: "Manage international product availability, catalog rules, and supported market prices.",
        href: "/shopify-markets-pricing",
        badge: "New",
        values: [false, false, false, true],
      },
      {
        label: "Custom fields",
        description: "Add synced metafields and private PIM fields for data and workflow needs beyond the default Shopify model.",
        href: "/shopify-custom-fields",
        values: [false, false, true, true],
      },
    ],
  },
  {
    label: "Support",
    description: "Get answers, onboarding help, and direct assistance as your operation grows.",
    features: [
      {
        label: "Help Center",
        description: "Use Peak PIM documentation and practical guides whenever you need an answer.",
        values: [true, true, true, true],
      },
      {
        label: "AI agent support (24/7)",
        description: "Get automated help with common Peak PIM questions at any time.",
        values: [true, true, true, true],
      },
      {
        label: "Human priority support",
        description: "Move support questions into the priority queue for a faster response from the Peak team.",
        values: [false, false, true, true],
      },
      {
        label: "Onboarding call",
        description: "Review setup, catalog structure, stores, and the workflows your team needs to run.",
        values: [false, false, true, "Custom onboarding"],
      },
      {
        label: "Dedicated account manager",
        description: "Work with a dedicated Peak PIM contact for your account and operating needs.",
        values: [false, false, false, true],
      },
    ],
  },
];
