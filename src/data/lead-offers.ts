export type LeadOffer = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  badges: readonly string[];
  submitLabel: string;
  successTitle: string;
  successDescription: string;
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
  },
} as const satisfies Record<string, LeadOffer>;

export type LeadOfferId = keyof typeof leadOffers;

export const defaultLeadOfferId: LeadOfferId = "30-day-extended-trial";

export function isLeadOfferId(value: string): value is LeadOfferId {
  return Object.prototype.hasOwnProperty.call(leadOffers, value);
}
