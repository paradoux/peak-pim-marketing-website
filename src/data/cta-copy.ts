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

export const bookDemoUrl = "/book-a-demo/";
export const googleBookingUrl = "https://calendar.app.google/xrdkJh8QCoHqiJzy7";
export const googleBookingEmbedUrl = "https://calendar.google.com/calendar/appointments/schedules/AcZssZ1_QwawE2iAjuSnFFCFE1fNCGIfmZCXXcLDcDZ3QR7o0KuAiTmpX5WJ_TmenVq7M_TFMa4rtD85?gv=true";

export const demoAutoOpen = {
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
} as const;

export type CanonicalCtaLabel = (typeof ctaLabels)[keyof typeof ctaLabels];

export const canonicalCtaLabels = Object.values(ctaLabels);

export const ctaExceptions = {
  headerDemo: "Demo with your data",
  liveDemo: "Live demo",
  apiDocumentation: "View API documentation",
  seeUseCase: "See use case",
} as const;

export const frenchCtaLabels = {
  getPeakPim: "Installer Peak PIM",
  tryFree: "Essayer gratuitement",
  bookDemo: "Réserver une démo",
  talkToUs: "Nous contacter",
  seePricing: "Voir les tarifs",
  seeHowItWorks: "Voir comment ça marche",
  seeComparison: "Voir la comparaison",
  seeComparisonCompact: "Comparer",
  learnMore: "En savoir plus",
  liveDemo: "Démo en ligne",
  apiDocumentation: "Voir la documentation API",
  seeUseCase: "Voir le cas client",
} as const;

export type CtaExceptionLabel = (typeof ctaExceptions)[keyof typeof ctaExceptions];
export type FrenchCtaLabel = (typeof frenchCtaLabels)[keyof typeof frenchCtaLabels];
export type CtaLabel = CanonicalCtaLabel | CtaExceptionLabel | FrenchCtaLabel;
export const approvedCtaLabels: CtaLabel[] = [...canonicalCtaLabels, ...Object.values(ctaExceptions), ...Object.values(frenchCtaLabels)];

export function isBookDemoLabel(label: CtaLabel) {
  return label === ctaLabels.bookDemo || label === frenchCtaLabels.bookDemo;
}

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
    (ctaHtml, tagName, attributes) => {
      const className = String(attributes).match(/class=(["'])(.*?)\1/i)?.[2] ?? "";
      if (!className.split(/\s+/).includes("button")) return ctaHtml;

      let normalized = ctaHtml;

      for (const [legacyLabel, canonicalLabel] of Object.entries(legacyCtaLabels)) {
        normalized = normalized.replaceAll(`>${legacyLabel}<`, `>${canonicalLabel}<`);
      }

      if (String(tagName).toLowerCase() === "a" && normalized.includes(`>${ctaLabels.bookDemo}<`)) {
        normalized = normalized.replace(/^<a\b([^>]*)>/i, (_openingTag, rawAttributes) => {
          let nextAttributes = String(rawAttributes)
            .replace(/\sdata-open-crisp(?:=(["'])[^"']*\1)?/gi, "")
            .replace(/\starget=(["'])[^"']*\1/gi, "")
            .replace(/\srel=(["'])[^"']*\1/gi, "");

          if (/\shref=(["'])[^"']*\1/i.test(nextAttributes)) {
            nextAttributes = nextAttributes.replace(/\shref=(["'])[^"']*\1/i, ` href="${bookDemoUrl}"`);
          } else {
            nextAttributes += ` href="${bookDemoUrl}"`;
          }

          return `<a${nextAttributes} data-demo-booking="" aria-haspopup="dialog" aria-controls="demo-booking-modal">`;
        });
      }

      return normalized;
    },
  );
}
