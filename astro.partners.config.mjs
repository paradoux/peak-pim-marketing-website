import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";

export default defineConfig({
  root: fileURLToPath(new URL("./partners/", import.meta.url)),
  site: "https://partners.peak-pim.com",
  srcDir: fileURLToPath(new URL("./partners/src/", import.meta.url)),
  publicDir: fileURLToPath(new URL("./partners/public/", import.meta.url)),
  outDir: fileURLToPath(new URL("./dist-partners/", import.meta.url)),
  cacheDir: fileURLToPath(new URL("./.astro/partners/", import.meta.url)),
  devToolbar: { enabled: false },
});
