import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const statusFile = resolve(projectRoot, "src/i18n/status.json");
const mode = process.argv.includes("--sync") ? "sync" : "check";
const status = JSON.parse(readFileSync(statusFile, "utf8"));
const failures = [];
let changed = false;

function sourceHash(sources) {
  const hash = createHash("sha256");

  function sourceFiles(source) {
    const absolutePath = resolve(projectRoot, source);
    if (!existsSync(absolutePath)) return [];
    if (!statSync(absolutePath).isDirectory()) return [source];

    return readdirSync(absolutePath, { withFileTypes: true })
      .flatMap((entry) => sourceFiles(`${source}/${entry.name}`))
      .sort();
  }

  for (const source of [...sources].sort()) {
    const absolutePath = resolve(projectRoot, source);
    if (!existsSync(absolutePath)) {
      failures.push(`Missing localization source: ${source}`);
      continue;
    }
    for (const file of sourceFiles(source)) {
      hash.update(file);
      hash.update("\0");
      hash.update(readFileSync(resolve(projectRoot, file)));
      hash.update("\0");
    }
  }

  return hash.digest("hex");
}

for (const unit of status.units) {
  const currentSourceHash = sourceHash(unit.sources);

  for (const translation of unit.translations) {
    if (!existsSync(resolve(projectRoot, translation))) failures.push(`Missing ${unit.locale} translation file: ${translation}`);
  }

  if (mode === "sync") {
    if (unit.observedSourceHash !== currentSourceHash) {
      unit.observedSourceHash = currentSourceHash;
      changed = true;
    }

    const nextStatus = unit.reviewedSourceHash === currentSourceHash ? "reviewed" : "stale";
    if (unit.status !== nextStatus) {
      unit.status = nextStatus;
      changed = true;
    }
  } else {
    if (unit.observedSourceHash !== currentSourceHash) {
      failures.push(`${unit.id} changed without updating the translation queue. Run npm run i18n:sync.`);
    }

    const expectedStatus = unit.reviewedSourceHash === currentSourceHash ? "reviewed" : "stale";
    if (unit.status !== expectedStatus) {
      failures.push(`${unit.id} has status ${unit.status}; expected ${expectedStatus}.`);
    }
  }
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

if (mode === "sync" && changed) {
  writeFileSync(statusFile, `${JSON.stringify(status, null, 2)}\n`);
}

const reviewedCount = status.units.filter((unit) => unit.status === "reviewed").length;
const staleUnits = status.units.filter((unit) => unit.status === "stale");
console.log(`Translation status: ${reviewedCount} reviewed, ${staleUnits.length} stale.`);
if (staleUnits.length) console.log(`Queued: ${staleUnits.map((unit) => unit.id).join(", ")}`);
