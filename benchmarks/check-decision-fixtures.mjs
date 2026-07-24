import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixtures = JSON.parse(
  await readFile(resolve(root, "benchmarks/evals/decisions.json"), "utf8"),
);

const failures = [];
for (const fixture of fixtures) {
  if (fixture.expectedRung < 0 || fixture.expectedRung > 5) {
    failures.push(`${fixture.id}: invalid rung`);
  }
  if (!fixture.scenario?.trim()) failures.push(`${fixture.id}: missing scenario`);
  if (fixture.highRisk && fixture.expectedRung === 1) {
    failures.push(`${fixture.id}: high-risk protection was silently suppressed`);
  }
  if (
    !fixture.highRisk
    && fixture.risk === "low"
    && fixture.expectedValue === "New regression test"
  ) {
    failures.push(`${fixture.id}: low-risk fixture creates permanent coverage`);
  }
}

const counts = fixtures.reduce((groups, item) => {
  const group = groups[item.expectedValue] ?? [];
  group.push(item);
  groups[item.expectedValue] = group;
  return groups;
}, {});
console.log("Mullet decision-policy fixtures");
for (const [verdict, items] of Object.entries(counts)) {
  console.log(`- ${verdict}: ${items.length}`);
}

const modeScenario = fixtures
  .filter((item) => item.id.startsWith("partner-import-"))
  .sort((a, b) => ["lite", "full", "ultra"].indexOf(a.mode)
    - ["lite", "full", "ultra"].indexOf(b.mode));
console.log("- mode boundary:", modeScenario
  .map((item) => `${item.mode}=${item.expectedValue}`)
  .join(", "));

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}

console.log(`PASS ${fixtures.length}/${fixtures.length} policy invariants`);
