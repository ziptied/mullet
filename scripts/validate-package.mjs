import { readFile, readdir, stat } from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if ([".git", "node_modules"].includes(entry.name)) continue;
    if (entry.name === "runs" && directory === join(root, "benchmarks")) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else files.push(path);
  }
  return files;
}

function fail(message) {
  failures.push(message);
}

function parseDescription(source) {
  const frontmatter = source.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatter) return null;
  const lines = frontmatter[1].split("\n");
  const start = lines.findIndex((line) => line.startsWith("description:"));
  if (start === -1) return null;
  const first = lines[start].replace(/^description:\s*>?\s*/, "");
  const continuation = [];
  for (const line of lines.slice(start + 1)) {
    if (!/^\s+/.test(line)) break;
    continuation.push(line.trim());
  }
  return [first, ...continuation].filter(Boolean).join(" ");
}

const files = await walk(root);
const skillFiles = files.filter((path) => path.endsWith("/SKILL.md"));
if (skillFiles.length !== 2) {
  fail(`expected exactly two SKILL.md files, found ${skillFiles.length}`);
}

const skillPath = join(root, "skills/mullet/SKILL.md");
let skill = "";
try {
  skill = await readFile(skillPath, "utf8");
} catch {
  fail("skills/mullet/SKILL.md is missing");
}

for (const path of skillFiles) {
  const source = await readFile(path, "utf8");
  const expectedName = basename(dirname(path));
  const name = source.match(/^name:\s*(\S+)\s*$/m)?.[1];
  if (name !== expectedName) {
    fail(`${relative(root, path)} name must be ${expectedName}, found ${name ?? "none"}`);
  }
  const description = parseDescription(source);
  if (!description) fail(`${relative(root, path)} description is missing`);
  else if (description.length > 1024) {
    fail(
      `${relative(root, path)} description is ${description.length} characters; `
      + "maximum is 1024",
    );
  }

  for (const match of source.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1];
    if (/^(https?:|#)/.test(target)) continue;
    const referencedPath = resolve(dirname(path), target);
    try {
      if (!(await stat(referencedPath)).isFile()) {
        fail(`${relative(root, path)} reference is not a file: ${target}`);
      }
    } catch {
      fail(`${relative(root, path)} reference is missing: ${target}`);
    }
  }
}

if (skill) {
  const lines = skill.trimEnd().split("\n").length;
  if (lines < 150 || lines > 250) {
    fail(`core runtime skill must remain 150-250 lines; found ${lines}`);
  }
  for (const snippet of [
    "## Existing removal gate",
    "positive evidence that no unique durable behavior",
    "comments, issue links, blame, or commits",
    "Ultra optimizes to the smallest faithful",
    "whole-file deletion, category-based deletion",
  ]) {
    if (!skill.includes(snippet)) fail(`core skill is missing policy: ${snippet}`);
  }
}

const corePolicyPhrase = "The core Mullet skill is the canonical decision policy";
let auditSkill = "";
try {
  auditSkill = await readFile(join(root, "skills/mullet-audit/SKILL.md"), "utf8");
} catch {
  fail("skills/mullet-audit/SKILL.md is missing");
}
if (auditSkill && !auditSkill.includes(corePolicyPhrase)) {
  fail("mullet-audit must declare the core Mullet skill canonical");
}

const pluginPath = join(root, ".cursor-plugin/plugin.json");
const marketplacePath = join(root, ".cursor-plugin/marketplace.json");
try {
  await stat(marketplacePath);
  fail(
    ".cursor-plugin/marketplace.json must not exist; "
    + "single-plugin repos use plugin.json only",
  );
} catch (error) {
  if (error && typeof error === "object" && "code" in error && error.code !== "ENOENT") {
    fail(".cursor-plugin/marketplace.json could not be checked");
  }
}
const packageManifest = JSON.parse(
  await readFile(join(root, "package.json"), "utf8"),
);
let plugin = null;
try {
  plugin = JSON.parse(await readFile(pluginPath, "utf8"));
} catch {
  fail(".cursor-plugin/plugin.json is missing or invalid JSON");
}
if (plugin) {
  if (plugin.name !== "mullet") fail("Cursor plugin name must be mullet");
  if (plugin.version !== packageManifest.version) {
    fail("Cursor plugin and package versions must match");
  }
  if (plugin.homepage !== "https://mulletest.dev") {
    fail("Cursor plugin homepage must point to https://mulletest.dev");
  }
  if (plugin.repository !== "https://github.com/ziptied/mullet") {
    fail("Cursor plugin repository must point to https://github.com/ziptied/mullet");
  }
  if (plugin.logo !== "assets/logo.svg") {
    fail("Cursor plugin must declare assets/logo.svg as its logo");
  } else {
    try {
      if (!(await stat(join(root, plugin.logo))).isFile()) {
        fail("Cursor plugin logo is not a file: assets/logo.svg");
      }
    } catch {
      fail("Cursor plugin logo is missing: assets/logo.svg");
    }
  }
  if (plugin.skills !== "./skills/") fail("Cursor plugin must declare ./skills/");
  if (plugin.agents !== "./agents/") fail("Cursor plugin must declare ./agents/");
  for (const field of ["skills", "agents"]) {
    const target = plugin[field];
    if (typeof target !== "string" || target.includes("..") || target.startsWith("/")) {
      fail(`Cursor plugin ${field} path must be relative and contained`);
    }
  }
}

const agentFiles = files.filter(
  (path) => dirname(path) === join(root, "agents") && path.endsWith(".md"),
);
if (agentFiles.length !== 4) {
  fail(`expected four Cursor audit agents, found ${agentFiles.length}`);
}
const agentNames = new Set();
for (const path of agentFiles) {
  const source = await readFile(path, "utf8");
  const name = source.match(/^name:\s*(\S+)\s*$/m)?.[1];
  const description = source.match(/^description:\s*(.+)\s*$/m)?.[1];
  const model = source.match(/^model:\s*(\S+)\s*$/m)?.[1];
  const readonly = source.match(/^readonly:\s*(\S+)\s*$/m)?.[1];
  if (!name) fail(`${relative(root, path)} is missing agent name`);
  else if (agentNames.has(name)) fail(`duplicate Cursor agent name: ${name}`);
  else agentNames.add(name);
  if (!description) fail(`${relative(root, path)} is missing description`);
  if (model !== "inherit") fail(`${relative(root, path)} model must be inherit`);
  if (readonly !== "true") fail(`${relative(root, path)} must be read-only`);
  if (!source.includes(corePolicyPhrase)) {
    fail(`${relative(root, path)} must declare the core Mullet skill canonical`);
  }
}
for (const expectedName of [
  "mullet-scope-mapper",
  "mullet-area-auditor",
  "mullet-overlap-reviewer",
  "mullet-verdict-challenger",
]) {
  if (!agentNames.has(expectedName)) fail(`missing Cursor agent: ${expectedName}`);
}

const datasets = [
  ["benchmarks/evals/triggers.train.json", 14],
  ["benchmarks/evals/triggers.validation.json", 10],
];
const ids = new Set();
for (const [path, expectedCount] of datasets) {
  const data = JSON.parse(await readFile(join(root, path), "utf8"));
  if (data.length !== expectedCount) {
    fail(`${path} must contain ${expectedCount} prompts; found ${data.length}`);
  }
  const positive = data.filter((item) => item.expectActivation).length;
  if (positive * 2 !== data.length) fail(`${path} must be label-balanced`);
  for (const item of data) {
    if (ids.has(item.id)) fail(`duplicate evaluation id: ${item.id}`);
    ids.add(item.id);
    if (!item.prompt?.trim()) fail(`empty prompt: ${item.id}`);
  }
}

const decisions = JSON.parse(
  await readFile(join(root, "benchmarks/evals/decisions.json"), "utf8"),
);
for (const item of decisions) {
  if (ids.has(item.id)) fail(`duplicate evaluation id: ${item.id}`);
  ids.add(item.id);
  if (
    item.actualConsequence === "serious"
    && item.credibleExposure === true
    && item.uniqueGap
    && item.expectedRung === 1
  ) {
    fail(`demonstrated serious fixture silently loses protection: ${item.id}`);
  }
}

const allText = (
  await Promise.all(
    files
      .filter((path) => /\.(md|json|mjs|yml)$/.test(path))
      .map((path) => readFile(path, "utf8")),
  )
).join("\n").toLowerCase();
const privateName = "kagi" + "bag";
if (allText.includes(privateName)) fail("private source name leaked into package");
if (files.some((path) => path.endsWith(".DS_Store"))) {
  fail("stray .DS_Store file found");
}

const readme = await readFile(join(root, "README.md"), "utf8");
for (const snippet of [
  "npx skills add ziptied/mullet --skill mullet",
  "mullet lite",
  "mullet full",
  "mullet ultra",
  "/mullet-audit",
  "~/.cursor/plugins/local/mullet",
  "https://mulletest.dev",
  "docs/cursor-marketplace-submission.md",
]) {
  if (!readme.includes(snippet)) fail(`README is missing: ${snippet}`);
}

if (failures.length) {
  console.error("Package validation failed:");
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

console.log(
  `Package valid: 2 skills, 4 read-only Cursor agents, `
  + `${skill.trimEnd().split("\n").length} core runtime lines`,
);
console.log(`Trigger fixtures: 24; decision fixtures: ${decisions.length}`);
console.log(`Checked ${files.length} package files under ${relative(dirname(root), root)}`);
