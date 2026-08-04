export type LeadOffer = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  badges: readonly string[];
  submitLabel: string;
  successTitle: string;
  successDescription: string;
  autoOpen?: {
    enabled: boolean;
    delayMs: number;
    scrollDepth: number;
    mobileDelayMs?: number;
    mobileScrollDepth?: number;
    cooldownDays: number;
    exactPaths?: readonly string[];
    pathPrefixes?: readonly string[];
    excludedPathPrefixes?: readonly string[];
  };
};

export const leadOffers = {
  "30-day-extended-trial": {
    id: "30-day-extended-trial",
    eyebrow: "",
    title: "Get your 30 days extended trial",
    description:
      "Get a full month to explore Peak PIM with your Shopify catalog.",
    badges: ["Free setup", "No credit card required"],
    submitLabel: "Get my 30-day trial",
    successTitle: "Your extended trial is requested",
    successDescription:
      "Our team will send you an email with all the information you need to set up and use your 30-day free trial. Check your inbox, and your spam folder just in case.",
    autoOpen: {
      enabled: true,
      delayMs: 60_000,
      scrollDepth: 55,
      mobileDelayMs: 85_000,
      mobileScrollDepth: 65,
      cooldownDays: 14,
      exactPaths: ["/"],
      pathPrefixes: [
        "/1-click-setup",
        "/api",
        "/bulk-edit",
        "/shopify-",
        "/ai-catalog-connector",
        "/developer-api",
        "/user-roles-permissions",
        "/industry/",
        "/vs/",
        "/build-vs-buy-pim",
        "/replace-your-shopify-app-stack",
        "/customers/",
      ],
      excludedPathPrefixes: ["/pricing", "/legals", "/admin", "/design-system"],
    },
  },
} as const satisfies Record<string, LeadOffer>;

export type LeadOfferId = keyof typeof leadOffers;

export const defaultLeadOfferId: LeadOfferId = "30-day-extended-trial";

export function isLeadOfferId(value: string): value is LeadOfferId {
  return Object.prototype.hasOwnProperty.call(leadOffers, value);
}
