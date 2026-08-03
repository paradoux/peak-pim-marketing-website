export const ctaLabels = {
  getPeakPim: "Get Peak PIM",
  tryFree: "Try for free",
  bookDemo: "Book a demo",
  talkToUs: "Talk to us",
  seePricing: "See pricing",
  seeHowItWorks: "See how it works",
  seeComparison: "See the comparison",
  seeComparisonCompact: "See comparison",
  learnMore: "Learn more",
} as const;

export type CanonicalCtaLabel = (typeof ctaLabels)[keyof typeof ctaLabels];

export const canonicalCtaLabels = Object.values(ctaLabels);

export const ctaExceptions = {
  liveDemo: "Live demo",
} as const;

export type CtaExceptionLabel = (typeof ctaExceptions)[keyof typeof ctaExceptions];
export type CtaLabel = CanonicalCtaLabel | CtaExceptionLabel;
export const approvedCtaLabels: CtaLabel[] = [...canonicalCtaLabels, ...Object.values(ctaExceptions)];

const legacyCtaLabels: Record<string, CanonicalCtaLabel> = {
  "Try Peak PIM free": ctaLabels.tryFree,
  "Ask for a demo": ctaLabels.bookDemo,
  "Book demo": ctaLabels.bookDemo,
  "Contact sales": ctaLabels.talkToUs,
  "Contact us": ctaLabels.talkToUs,
  "Ask your question": ctaLabels.talkToUs,
  "Ask us anything": ctaLabels.talkToUs,
  "Ask for advices": ctaLabels.talkToUs,
  "See full comparison": ctaLabels.seeComparison,
  "Full comparison": ctaLabels.seeComparison,
  "Compare all PIMs": ctaLabels.seeComparison,
  "Compare PIM options": ctaLabels.seeComparison,
  "Review the decision": ctaLabels.seeComparison,
  Compare: ctaLabels.seeComparison,
  "See current pricing": ctaLabels.seePricing,
  "See the workflow": ctaLabels.seeHowItWorks,
  "See the translation workflow": ctaLabels.seeHowItWorks,
  "Discover how to take control": ctaLabels.seeHowItWorks,
  "See the solution": ctaLabels.seeHowItWorks,
  "See what you'll replace": ctaLabels.seeHowItWorks,
  "See what you’ll replace": ctaLabels.seeHowItWorks,
  "See what Peak PIM adds": ctaLabels.seeHowItWorks,
  "Discover PIM types": ctaLabels.learnMore,
  "Discover Peak PIM": ctaLabels.learnMore,
  Explore: ctaLabels.learnMore,
  View: ctaLabels.learnMore,
  "See more": ctaLabels.learnMore,
};

export function normalizeCtaLabel(label: string): CanonicalCtaLabel | string {
  return legacyCtaLabels[label] ?? label;
}

export function normalizeCtaCopyInHtml(html: string) {
  return html.replace(
    /<(a|button)\b([^>]*)>[\s\S]*?<\/\1>/gi,
    (ctaHtml, _tagName, attributes) => {
      const className = String(attributes).match(/class=(["'])(.*?)\1/i)?.[2] ?? "";
      if (!className.split(/\s+/).includes("button")) return ctaHtml;

      let normalized = ctaHtml;

      for (const [legacyLabel, canonicalLabel] of Object.entries(legacyCtaLabels)) {
        normalized = normalized.replaceAll(`>${legacyLabel}<`, `>${canonicalLabel}<`);
      }

      return normalized;
    },
  );
}
