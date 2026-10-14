import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

export default defineConfig({
  ...base,
  testDir: "./tests/partners",
  use: { ...base.use, baseURL: process.env.PEAK_PARTNERS_BASE_URL ?? "http://localhost:4323" },
  webServer: process.env.PEAK_PARTNERS_BASE_URL ? undefined : {
    command: "astro preview --config astro.partners.config.mjs --port 4323",
    url: "http://localhost:4323",
    reuseExistingServer: !process.env.CI,
  },
});
