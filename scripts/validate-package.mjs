import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
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
if (skillFiles.length !== 1) {
  fail(`expected exactly one SKILL.md, found ${skillFiles.length}`);
}

const skillPath = join(root, "skills/mullet/SKILL.md");
let skill = "";
try {
  skill = await readFile(skillPath, "utf8");
} catch {
  fail("skills/mullet/SKILL.md is missing");
}

if (skill) {
  const name = skill.match(/^name:\s*(\S+)\s*$/m)?.[1];
  if (name !== "mullet") fail(`skill name must be mullet, found ${name ?? "none"}`);
  const description = parseDescription(skill);
  if (!description) fail("skill description is missing");
  else if (description.length > 1024) {
    fail(`skill description is ${description.length} characters; maximum is 1024`);
  }

  const lines = skill.trimEnd().split("\n").length;
  if (lines < 150 || lines > 250) {
    fail(`runtime skill must remain 150-250 lines; found ${lines}`);
  }

  for (const match of skill.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1];
    if (/^(https?:|#)/.test(target)) continue;
    const path = resolve(dirname(skillPath), target);
    try {
      if (!(await stat(path)).isFile()) fail(`skill reference is not a file: ${target}`);
    } catch {
      fail(`skill reference is missing: ${target}`);
    }
  }
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
  if (item.highRisk && item.expectedRung === 1) {
    fail(`high-risk fixture silently loses protection: ${item.id}`);
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
]) {
  if (!readme.includes(snippet)) fail(`README is missing: ${snippet}`);
}

if (failures.length) {
  console.error("Package validation failed:");
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

console.log(`Package valid: 1 skill, ${skill.trimEnd().split("\n").length} runtime lines`);
console.log(`Trigger fixtures: 24; decision fixtures: ${decisions.length}`);
console.log(`Checked ${files.length} package files under ${relative(dirname(root), root)}`);
