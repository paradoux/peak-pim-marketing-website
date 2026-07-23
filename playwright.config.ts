import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/visual",
  fullyParallel: true,
  workers: 2,
  timeout: 120_000,
  expect: {
    timeout: 30_000,
  },
  retries: 0,
  reporter: "list",
  snapshotPathTemplate: "{testDir}/__screenshots__/{arg}{ext}",
  use: {
    baseURL: process.env.PEAK_VISUAL_BASE_URL ?? "http://localhost:4321",
    browserName: "chromium",
    channel: "chrome",
    headless: true,
    reducedMotion: "reduce",
    colorScheme: "light",
    locale: "en-US",
    timezoneId: "Europe/Paris",
  },
});
