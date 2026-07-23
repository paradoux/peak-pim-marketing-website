export type LandingPageArchetype = {
  id: "feature" | "use-case" | "industry" | "comparison";
  name: string;
  purpose: string;
  requiredSections: string[];
  optionalSections: string[];
  approvedReferences: string[];
};

export const landingPageArchetypes: LandingPageArchetype[] = [
  {
    id: "feature",
    name: "Feature page",
    purpose: "Explain a single Peak PIM capability and convert visitors with a concrete product workflow.",
    requiredSections: ["Split or centered hero", "Problem grid", "Product workflow", "Feature grid", "CTA", "FAQ"],
    optionalSections: ["Logo cloud", "Testimonial", "Pricing teaser"],
    approvedReferences: ["/bulk-edit", "/shopify-media-management", "/shopify-sync", "/1-click-setup"],
  },
  {
    id: "use-case",
    name: "Use-case / SEO landing page",
    purpose: "Show how Peak solves a specific catalog workflow for Shopify teams.",
    requiredSections: ["Split hero with workflow demo", "Problem grid", "Complete three-card workflow", "Benefits", "CTA", "Topic FAQ"],
    optionalSections: ["Logo cloud", "Testimonial", "Pricing teaser"],
    approvedReferences: ["/shopify-multi-store-pim", "/replace-your-shopify-app-stack", "/shopify-pim-translations"],
  },
  {
    id: "industry",
    name: "Industry page",
    purpose: "Connect an industry-specific operating model to Peak workflows and proof.",
    requiredSections: ["Editorial split hero", "Industry stats", "Logo cloud", "Workflow chapters", "Capabilities", "CTA", "FAQ"],
    optionalSections: ["Testimonial", "Setup steps"],
    approvedReferences: ["/industry/fashion"],
  },
  {
    id: "comparison",
    name: "Comparison page",
    purpose: "Help a high-intent buyer choose between Peak and an alternative using fair, concrete evidence.",
    requiredSections: ["Split comparison hero", "Verdict", "Side-by-side table", "Pricing comparison", "Decision guide", "Migration steps", "CTA", "FAQ"],
    optionalSections: ["Product workflow", "Testimonial"],
    approvedReferences: ["/vs/akeneo", "/vs/plytix", "/vs/catsy", "/vs/quable", "/vs/shopify-admin"],
  },
];

export const excludedDesignSystemPages = ["/partners"] as const;

export const approvedMotionPatterns = [
  "Field focus and save",
  "Bulk row edit",
  "Catalog-to-store sync",
  "Selection sequence",
  "Progress timeline",
  "Accordion disclosure",
] as const;
