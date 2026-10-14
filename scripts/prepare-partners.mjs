import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

// Copy only shared visual assets, never the marketing site's routing or crawler files.
const root = new URL("../", import.meta.url);
for (const directory of ["assets", "mirror"]) {
  const source = new URL(`public/${directory}/`, root);
  const destination = new URL(`partners/public/${directory}/`, root);
  await rm(destination, { recursive: true, force: true });
  await mkdir(destination, { recursive: true });
  await cp(source, destination, {
    recursive: true,
    filter: (path) => path !== resolve("public/assets/ads"),
  });
}
console.log("Partner-site shared assets prepared.");
