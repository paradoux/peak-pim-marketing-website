import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const requiredFiles = [
  "src/layouts/LandingPageLayout.astro",
  "src/components/ui/Button.astro",
  "src/components/ui/PeakIcon.astro",
  "src/components/ui/SectionHeading.astro",
  "src/components/sections/Hero.astro",
  "src/components/sections/LogoCloud.astro",
  "src/components/sections/ProblemGrid.astro",
  "src/components/sections/CardGrid.astro",
  "src/components/sections/FeatureSteps.astro",
  "src/components/sections/FeatureGrid.astro",
  "src/components/sections/Testimonial.astro",
  "src/components/sections/CtaBanner.astro",
  "src/components/sections/Faq.astro",
  "src/components/visuals/TranslationWorkflowDemo.astro",
  "src/components/visuals/TranslationStepVisual.astro",
  "src/pages/design-system.astro",
  "src/pages/shopify-pim-translations.astro",
  "skills/peak-landing-pages/SKILL.md",
];

const failures = [];
for (const file of requiredFiles) {
  if (!existsSync(resolve(projectRoot, file))) failures.push(`Missing ${file}`);
}

const canonicalContracts = {
  "src/components/sections/Hero.astro": ["peak-hero", "peak-hero__component", "peak-hero__visual", "section_header26", "header26_component", "heading-style-h1", "button-group is-center"],
  "src/components/sections/LogoCloud.astro": ["peak-logo-cloud", "peak-logo-cloud__component", "peak-logo-cloud__list", "peak-logo-cloud__item", "section_logo3", "heading-style-h6-logos", "logo3_component", "logo3_list"],
  "src/components/sections/ProblemGrid.astro": ["peak-problem-grid", "peak-problem-grid__component", "peak-problem-grid__list", "peak-problem-grid__item", "section_layout237", "layout237_list", "heading-style-h4"],
  "src/components/sections/CardGrid.astro": ["peak-card-grid", "peak-card-grid__component", "peak-card-grid__list", "peak-card-grid__card", "section_layout395", "layout395_grid-list", "layout395_row", "layout395_card", "layout395_card-image-wrapper", "layout395_card-content", "heading-style-h4"],
  "src/components/sections/FeatureSteps.astro": ["peak-feature-steps", "peak-feature-steps__component", "peak-feature-steps__list", "peak-feature-steps__item", "section_layout239", "layout239_list", "layout239_image-wrapper", "heading-style-h4"],
  "src/components/sections/FeatureGrid.astro": ["peak-feature-grid", "peak-feature-grid__component", "peak-feature-grid__list", "peak-feature-grid__card", "section_layout353", "layout353_component", "features.length !== 4", "content-item-${index + 1}", "heading-style-h5", "data-feature-grid-cards", "synchronizeCardHeights"],
  "src/components/sections/Testimonial.astro": ["peak-testimonial", "peak-testimonial__component", "peak-testimonial__client", "section_testimonial4", "testimonial4_client", "testimonial4_logo"],
  "src/components/sections/CtaBanner.astro": ["peak-cta-banner", "peak-cta-banner__component", "peak-cta-banner__card", "section_cta51", "cta51_card peak-cta-banner__card color-scheme-2"],
  "src/components/sections/Faq.astro": ["peak-faq", "peak-faq__component", "peak-faq__list", "peak-faq__item", "peak-faq__question", "peak-faq__answer", "section_faq1", "faq1_question", "faq1_answer"],
};

for (const [file, contracts] of Object.entries(canonicalContracts)) {
  const source = readFileSync(resolve(projectRoot, file), "utf8");
  for (const contract of contracts) {
    if (!source.includes(contract)) failures.push(`${file} is missing canonical class: ${contract}`);
  }
  if (/\bds-[\w-]+/.test(source)) failures.push(`${file} contains a parallel ds-* design pattern`);
}

const designSystemSource = readFileSync(resolve(projectRoot, "src/pages/design-system.astro"), "utf8");
if (/from ["'][^"']*partners/i.test(designSystemSource)) failures.push("The catalogue imports the unfinished partners page");

const globalStyles = readFileSync(resolve(projectRoot, "src/styles/global.css"), "utf8");
for (const rule of ["-webkit-font-smoothing: antialiased", "-moz-osx-font-smoothing: grayscale"]) {
  if (!globalStyles.includes(rule)) failures.push(`Global typography is missing the original rendering rule: ${rule}`);
}

const featureGridSource = readFileSync(resolve(projectRoot, "src/components/sections/FeatureGrid.astro"), "utf8");
if (featureGridSource.includes("Math.min(index + 1, 4)")) failures.push("FeatureGrid must not extend the original four-card sticky interaction");

const recipeSource = readFileSync(resolve(projectRoot, "src/data/landing-page-recipes.ts"), "utf8");
const approvedReferences = recipeSource.split("export const excludedDesignSystemPages")[0];
if (approvedReferences.includes('"/partners"')) failures.push("The unfinished partners page appears in approved references");

for (const page of ["bulk-edit", "design-system", "shopify-pim-translations"]) {
  const file = resolve(projectRoot, "dist", page, "index.html");
  if (!existsSync(file)) {
    failures.push(`Missing built page /${page}; run npm run build first`);
    continue;
  }
  const html = readFileSync(file, "utf8");
  const h1Count = (html.match(/<h1\b/gi) ?? []).length;
  if (h1Count !== 1) failures.push(`/${page} has ${h1Count} h1 elements; expected one`);
  if (!html.includes("main-wrapper")) failures.push(`/${page} is missing the canonical main wrapper`);
}

const translationFile = resolve(projectRoot, "dist/shopify-pim-translations/index.html");
if (existsSync(translationFile)) {
  const html = readFileSync(translationFile, "utf8");
  for (const className of ["section_header26", "section_logo3", "section_layout237", "section_layout395", "section_testimonial4", "section_layout353", "section_cta51", "section_faq1"]) {
    if (!html.includes(className)) failures.push(`Translations page is missing ${className}`);
  }
  for (const className of ["peak-hero", "peak-logo-cloud", "peak-problem-grid", "peak-card-grid", "peak-testimonial", "peak-feature-grid", "peak-cta-banner", "peak-faq"]) {
    if (!html.includes(className)) failures.push(`Translations page is missing semantic component alias ${className}`);
  }
  if (/\bds-[\w-]+/.test(html)) failures.push("Translations page contains parallel ds-* classes");
  if (!html.includes('rel="canonical" href="https://peak-pim.com/shopify-pim-translations"')) failures.push("Translations canonical URL is incorrect");
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`Design-system contract passed (${requiredFiles.length} required files).`);
