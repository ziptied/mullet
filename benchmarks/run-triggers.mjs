import { spawnSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);

function option(name, fallback) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
}

const runs = Number(option("--runs", "3"));
const limit = Number(option("--limit", "0"));
const split = option("--split", "all");
const ids = option("--ids", "").split(",").filter(Boolean);
const codexBin = option("--codex", process.env.CODEX_BIN || "codex");
const model = option("--model", process.env.CODEX_MODEL || "");
const timeout = Number(option("--timeout-ms", "180000"));

if (!Number.isInteger(runs) || runs < 1) {
  throw new Error("--runs must be a positive integer");
}
if (!["all", "train", "validation"].includes(split)) {
  throw new Error("--split must be all, train, or validation");
}

const datasetPaths = [];
if (split !== "validation") datasetPaths.push("triggers.train.json");
if (split !== "train") datasetPaths.push("triggers.validation.json");
let prompts = [];
for (const path of datasetPaths) {
  const items = JSON.parse(
    await readFile(resolve(root, "benchmarks/evals", path), "utf8"),
  );
  prompts.push(...items.map((item) => ({ ...item, split: path.split(".")[1] })));
}
if (ids.length) prompts = prompts.filter((item) => ids.includes(item.id));
if (limit > 0) prompts = prompts.slice(0, limit);

const projectFiles = {
  JavaScript: ["src/app.js", "export function placeholder() { return true; }\n"],
  Python: ["app.py", "def placeholder():\n    return True\n"],
  PHP: ["app.php", "<?php\nfunction placeholder(): bool { return true; }\n"],
  Go: ["main.go", "package main\n\nfunc main() {}\n"],
  Rust: ["src/lib.rs", "pub fn placeholder() -> bool { true }\n"],
  Java: ["src/Main.java", "final class Main {}\n"],
  General: ["README.md", "# Evaluation workspace\n"],
};

function version(command, versionArgs) {
  const result = spawnSync(command, versionArgs, { encoding: "utf8" });
  return result.status === 0
    ? (result.stdout || result.stderr).trim()
    : "unavailable";
}

function detected(raw) {
  const text = raw.toLowerCase();
  const readPath = (
    text.includes(".agents/skills/mullet/skill.md")
    || text.includes(".codex/skills/mullet/skill.md")
    || text.includes("skills/mullet/skill.md")
  );
  const announced = (
    text.includes("using the mullet skill")
    || text.includes("applying the mullet skill")
    || text.includes("i’m using mullet")
    || text.includes("i'm using mullet")
  );
  return { activated: readPath, readPath, announced };
}

const records = [];
for (const prompt of prompts) {
  for (let run = 1; run <= runs; run += 1) {
    const workspace = await mkdtemp(resolve(tmpdir(), "mullet-trigger-"));
    try {
      const installDir = resolve(workspace, ".agents/skills/mullet");
      await mkdir(dirname(installDir), { recursive: true });
      await cp(resolve(root, "skills/mullet"), installDir, { recursive: true });
      await writeFile(
        resolve(workspace, "skills-lock.json"),
        `${JSON.stringify({
          version: 1,
          skills: {
            mullet: {
              source: root,
              sourceType: "local",
              computedHash: "trigger-benchmark-local-copy",
            },
          },
        }, null, 2)}\n`,
      );
      const [projectPath, projectSource] = projectFiles[prompt.language];
      await mkdir(dirname(resolve(workspace, projectPath)), { recursive: true });
      await writeFile(resolve(workspace, projectPath), projectSource);
      await writeFile(
        resolve(workspace, "AGENTS.md"),
        "This workspace is read-only. Inspect it, then respond concisely with "
        + "the implementation and verification approach; do not attempt edits.\n",
      );

      const codexArgs = [
        "exec",
        "--ephemeral",
        "--skip-git-repo-check",
        "-s",
        "read-only",
        "-C",
        workspace,
        "--json",
      ];
      if (model) codexArgs.push("-m", model);
      codexArgs.push(prompt.prompt);

      const started = Date.now();
      const result = spawnSync(codexBin, codexArgs, {
        encoding: "utf8",
        timeout,
        maxBuffer: 20 * 1024 * 1024,
      });
      const raw = `${result.stdout || ""}\n${result.stderr || ""}`;
      const detection = detected(raw);
      records.push({
        id: prompt.id,
        split: prompt.split,
        kind: prompt.kind,
        language: prompt.language,
        expected: prompt.expectActivation,
        run,
        ...detection,
        correct: (
          result.status === 0
          && result.error?.code !== "ETIMEDOUT"
          && detection.activated === prompt.expectActivation
        ),
        exitCode: result.status,
        timedOut: result.error?.code === "ETIMEDOUT",
        durationMs: Date.now() - started,
        failureExcerpt: (
          result.status === 0 && result.error?.code !== "ETIMEDOUT"
        ) ? undefined : raw.slice(-4000),
      });
      console.log(
        `${prompt.id} #${run}: expected=${prompt.expectActivation} `
        + `activated=${detection.activated}`,
      );
    } finally {
      await rm(workspace, { recursive: true, force: true });
    }
  }
}

function rate(items, predicate) {
  return items.length
    ? items.filter(predicate).length / items.length
    : null;
}

const completed = records.filter(
  (item) => item.exitCode === 0 && !item.timedOut,
);
const positives = records.filter((item) => item.expected);
const negatives = records.filter((item) => !item.expected);
const explicit = positives.filter((item) => item.kind === "explicit");
const implicit = positives.filter((item) => item.kind === "implicit");
const validation = completed.filter((item) => item.split === "validation");
const summary = {
  generatedAt: new Date().toISOString(),
  codexVersion: version(codexBin, ["--version"]),
  installationMethod: "local skill copy with Skills CLI lock manifest",
  model: model || "Codex default",
  runs,
  prompts: prompts.length,
  completedRuns: completed.length,
  rates: {
    overallCorrect: rate(completed, (item) => item.correct),
    explicitActivationObserved: rate(explicit, (item) => item.activated),
    implicitActivationObserved: rate(implicit, (item) => item.activated),
    validationCorrect: rate(validation, (item) => item.correct),
    falseActivationObserved: rate(negatives, (item) => item.activated),
  },
  thresholds: {
    explicitActivationObserved: 1,
    implicitActivationObserved: 0.8,
    validationCorrect: 0.9,
    falseActivationObservedMaximum: 0.1,
  },
};

await mkdir(resolve(root, "benchmarks/runs"), { recursive: true });
const output = resolve(root, "benchmarks/runs/latest.json");
await writeFile(output, `${JSON.stringify({ summary, records }, null, 2)}\n`);

console.log(JSON.stringify(summary, null, 2));
console.log(`Detailed results: ${basename(output)}`);

const thresholdFailures = [];
if (
  summary.rates.explicitActivationObserved !== null
  && summary.rates.explicitActivationObserved
    < summary.thresholds.explicitActivationObserved
) {
  thresholdFailures.push("explicit activation");
}
if (
  summary.rates.implicitActivationObserved !== null
  && summary.rates.implicitActivationObserved
    < summary.thresholds.implicitActivationObserved
) {
  thresholdFailures.push("implicit activation");
}
if (
  summary.rates.validationCorrect !== null
  && summary.rates.validationCorrect < summary.thresholds.validationCorrect
) {
  thresholdFailures.push("validation correctness");
}
if (
  summary.rates.falseActivationObserved !== null
  && summary.rates.falseActivationObserved
    > summary.thresholds.falseActivationObservedMaximum
) {
  thresholdFailures.push("false activation");
}
if (records.some((item) => item.exitCode !== 0 || item.timedOut)) {
  thresholdFailures.push("runner completion");
}
if (thresholdFailures.length) {
  console.error(`Threshold failures: ${thresholdFailures.join(", ")}`);
  process.exit(1);
}
