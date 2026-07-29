import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixtures = JSON.parse(
  await readFile(resolve(root, "benchmarks/evals/decisions.json"), "utf8"),
);

const failures = [];
const consequences = new Set(["none", "low", "material", "serious"]);
const finalRungs = new Set([0, 1, 2, 3, 5]);
for (const fixture of fixtures) {
  if (!finalRungs.has(fixture.expectedRung)) {
    failures.push(`${fixture.id}: invalid rung`);
  }
  if (!fixture.scenario?.trim()) failures.push(`${fixture.id}: missing scenario`);
  if (!fixture.domain?.trim()) failures.push(`${fixture.id}: missing domain`);
  if (!consequences.has(fixture.actualConsequence)) {
    failures.push(`${fixture.id}: invalid actualConsequence`);
  }
  if (![true, false, null].includes(fixture.credibleExposure)) {
    failures.push(`${fixture.id}: invalid credibleExposure`);
  }
  if (typeof fixture.uniqueGap !== "boolean") {
    failures.push(`${fixture.id}: invalid uniqueGap`);
  }
  if (
    fixture.actualConsequence === "serious"
    && fixture.credibleExposure === true
    && fixture.uniqueGap
    && fixture.expectedRung === 1
  ) {
    failures.push(`${fixture.id}: demonstrated serious protection was suppressed`);
  }
  if (
    fixture.actualConsequence === "none"
    && ["Keep", "Extend existing", "New regression test"].includes(
      fixture.expectedValue,
    )
  ) {
    failures.push(`${fixture.id}: no-consequence fixture preserves protection`);
  }
  if (!fixture.uniqueGap && fixture.expectedValue === "New regression test") {
    failures.push(`${fixture.id}: duplicate or covered fixture creates protection`);
  }
  if (
    ["full", "ultra"].includes(fixture.mode)
    && ["material", "serious"].includes(fixture.actualConsequence)
    && fixture.credibleExposure === null
    && fixture.expectedRung !== 0
  ) {
    failures.push(`${fixture.id}: unresolved material exposure is not Pending`);
  }
  if (
    fixture.risk === "low"
    && fixture.expectedValue === "New regression test"
  ) {
    failures.push(`${fixture.id}: low-risk fixture creates permanent coverage`);
  }
}

const requiredLeoFixtureValues = new Map([
  ["existing-config-coercion-sentinel", "Keep"],
  ["existing-external-index-contract", "Keep"],
  ["existing-upgrade-route-compat", "Keep"],
  ["existing-negative-database-oracle", "Consolidate"],
]);
const fixtureById = new Map(fixtures.map((fixture) => [fixture.id, fixture]));
for (const [id, expectedValue] of requiredLeoFixtureValues) {
  const fixture = fixtureById.get(id);
  if (!fixture) failures.push(`missing LEO-style deletion fixture: ${id}`);
  else if (fixture.expectedValue !== expectedValue) {
    failures.push(`${id}: expected ${expectedValue}, found ${fixture.expectedValue}`);
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
