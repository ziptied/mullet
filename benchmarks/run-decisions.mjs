import { spawnSync } from "node:child_process";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);

function option(name, fallback) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
}

const runs = Number(option("--runs", "1"));
const limit = Number(option("--limit", "0"));
const ids = option("--ids", "").split(",").filter(Boolean);
const codexBin = option("--codex", process.env.CODEX_BIN || "codex");
const model = option("--model", process.env.CODEX_MODEL || "");
const timeout = Number(option("--timeout-ms", "120000"));

let fixtures = JSON.parse(
  await readFile(resolve(root, "benchmarks/evals/decisions.json"), "utf8"),
);
if (ids.length) fixtures = fixtures.filter((item) => ids.includes(item.id));
if (limit > 0) fixtures = fixtures.slice(0, limit);

const values = [
  "No permanent test",
  "Extend existing",
  "New regression test",
  "Revise",
  "Consolidate",
  "Keep",
  "Candidate for removal",
  "Ask or preserve",
];
const records = [];

for (const fixture of fixtures) {
  for (let run = 1; run <= runs; run += 1) {
    const workspace = await mkdtemp(resolve(tmpdir(), "mullet-decision-"));
    try {
      const installDir = resolve(workspace, ".agents/skills/mullet");
      await mkdir(dirname(installDir), { recursive: true });
      await cp(resolve(root, "skills/mullet"), installDir, { recursive: true });

      const schemaPath = resolve(workspace, "decision.schema.json");
      const outputPath = resolve(workspace, "decision.json");
      await writeFile(schemaPath, JSON.stringify({
        type: "object",
        properties: {
          intensity: { type: "string", enum: ["lite", "full", "ultra"] },
          rung: { type: "integer", enum: [0, 1, 2, 3, 5] },
          verification: { type: "string" },
          value: { type: "string", enum: values },
          action: { type: "string" },
          why: { type: "string" },
        },
        required: ["intensity", "rung", "verification", "value", "action", "why"],
        additionalProperties: false,
      }));

      const prompt = [
        `Read and apply the installed Mullet skill in ${fixture.mode} mode.`,
        "This is a decision evaluation; do not modify files.",
        "Report the final disposition rung: 0 Pending, 1 no durable value, "
        + "2 already covered, 3 extend existing, or 5 create protection. "
        + "Rung 4 chooses scope and is never the final disposition.",
        `Situation: ${fixture.scenario}`,
      ].join("\n");
      const codexArgs = [
        "exec",
        "--ephemeral",
        "--skip-git-repo-check",
        "-s",
        "read-only",
        "-C",
        workspace,
        "--output-schema",
        schemaPath,
        "--output-last-message",
        outputPath,
      ];
      if (model) codexArgs.push("-m", model);
      codexArgs.push(prompt);

      const started = Date.now();
      const result = spawnSync(codexBin, codexArgs, {
        encoding: "utf8",
        timeout,
        maxBuffer: 20 * 1024 * 1024,
      });
      let observed = null;
      try {
        observed = JSON.parse(await readFile(outputPath, "utf8"));
      } catch {
        observed = null;
      }
      const completed = result.status === 0 && !result.error;
      const correct = (
        completed
        && observed?.intensity === fixture.mode
        && observed?.rung === fixture.expectedRung
        && observed?.value === fixture.expectedValue
      );
      records.push({
        id: fixture.id,
        mode: fixture.mode,
        run,
        expected: {
          rung: fixture.expectedRung,
          value: fixture.expectedValue,
        },
        observed,
        completed,
        correct,
        exitCode: result.status,
        timedOut: result.error?.code === "ETIMEDOUT",
        durationMs: Date.now() - started,
        failureExcerpt: completed
          ? undefined
          : `${result.stdout || ""}\n${result.stderr || ""}`.slice(-4000),
      });
      console.log(
        `${fixture.id} #${run}: expected=${fixture.expectedValue}/rung`
        + `${fixture.expectedRung} observed=${observed?.value ?? "none"}/rung`
        + `${observed?.rung ?? "none"} correct=${correct}`,
      );
    } finally {
      await rm(workspace, { recursive: true, force: true });
    }
  }
}

const correctCount = records.filter((item) => item.correct).length;
const suppressingValues = new Set(["No permanent test", "Candidate for removal"]);
const seriousProtectionErrors = records.filter((item) => {
  const fixture = fixtures.find((candidate) => candidate.id === item.id);
  return (
    fixture?.actualConsequence === "serious"
    && fixture?.credibleExposure === true
    && fixture?.uniqueGap
    && item.completed
    && (item.observed?.rung === 1 || suppressingValues.has(item.observed?.value))
  );
}).length;
const versionResult = spawnSync(codexBin, ["--version"], { encoding: "utf8" });
const summary = {
  generatedAt: new Date().toISOString(),
  codexVersion: (
    versionResult.stdout || versionResult.stderr || "unavailable"
  ).trim(),
  model: model || "Codex default",
  runs,
  fixtures: fixtures.length,
  correct: correctCount,
  accuracy: records.length ? correctCount / records.length : null,
  seriousProtectionErrors,
};

await mkdir(resolve(root, "benchmarks/runs"), { recursive: true });
await writeFile(
  resolve(root, "benchmarks/runs/latest-decisions.json"),
  `${JSON.stringify({ summary, records }, null, 2)}\n`,
);
console.log(JSON.stringify(summary, null, 2));

if (correctCount !== records.length || seriousProtectionErrors) process.exit(1);
