# Mullet

**Verify every change. Keep only tests that repay their maintenance.**

[mulletest.dev](https://mulletest.dev) · [GitHub](https://github.com/ziptied/mullet)

Status: experimental preview. Decision diagnostics are promising; automatic
invocation remains below the release threshold. Cursor users can explicitly
launch read-only scoped or whole-application audits through the bundled plugin.

Mullet is a tiny, framework-agnostic Agent Skill that decides whether a software
change needs lasting regression coverage. It separates proof that a change works
today from protection worth carrying for years.

It is intentionally pushy: once installed, its description tells compatible
agents to consult Mullet before they create, modify, delete, or recommend tests
or test infrastructure—even when you did not explicitly ask for Mullet.

## Why

AI coding agents are good at producing tests and poor at feeling their future
cost. In a new project, they can turn every implementation detail into a
contract, create speculative helpers and fixtures, and leave the team with a
large suite that changes whenever the product changes.

Mullet makes permanent tests opt-in. It still requires verification of every
change, then asks whether a lasting test protects a consequential, durable,
otherwise-uncovered risk.

## Install

After the repository is published at `ziptied/mullet`, install from GitHub with
the [Skills CLI](https://github.com/vercel-labs/skills):

```sh
npx skills add ziptied/mullet --skill mullet
```

Before publication, install this checkout locally:

```sh
npx skills add . --skill mullet
```

Install globally for Codex so it is available in every project:

```sh
npx skills add ziptied/mullet --skill mullet -g -a codex -y
```

Install globally for every supported agent:

```sh
npx skills add ziptied/mullet --skill mullet -g -a '*' -y
```

Install the explicit portable audit skill when the target supports Agent Skills
but not Cursor plugins:

```sh
npx skills add ziptied/mullet --skill mullet-audit
```

Skill activation remains the agent's decision. Global installation plus
Mullet's intent-rich description gives it the best portable chance of automatic
use. The current single-run post-tuning evaluation did not meet the
automatic-activation release threshold, so say `use mullet` when a particular
run must use it.

### Cursor plugin

Mullet is also a Cursor plugin that bundles both skills and four read-only audit
subagents. For local development, clone the repository and link it into Cursor's
local plugin directory:

```sh
ln -s /absolute/path/to/mullet ~/.cursor/plugins/local/mullet
```

Reload Cursor, then invoke `/mullet-audit`. The plugin manifest is ready for a
Cursor marketplace submission, but this preview is not claiming marketplace
publication.

### Cursor marketplace

Marketplace listing details are prepared in
[docs/cursor-marketplace-submission.md](docs/cursor-marketplace-submission.md).
The public listing uses the same positioning as [mulletest.dev](https://mulletest.dev):
“Create tests that repay their maintenance.”

Release checks before submission:

```sh
npm test
npm run check:decisions
npm run eval:decisions -- --model gpt-5.4 --runs 1
npm run eval:triggers -- --model gpt-5.4 --runs 3
npm pack --dry-run
```

For public Cursor Marketplace submission, this repo is packaged as a single
plugin with `.cursor-plugin/plugin.json` at the repository root, a committed
`assets/logo.svg`, and no required repository-level marketplace manifest.

## Three intensities

Mullet supports three named intensity arguments. The default is balanced.

Here, “aggression” means resistance to adding permanent tests.

| Command | Suppression pressure | Character | Best fit |
|---|---:|---|---|
| `mullet lite` | Low | **Rigorous.** Allows reasonable inference when a concrete consequential risk exists. | Mature products, compliance-sensitive work, teams that favor a denser safety net. |
| `mullet full` | Medium | **Balanced.** Requires positive evidence that regression risk and boundary durability repay cost. | Ordinary product development. |
| `mullet ultra` | High | **Canary.** Keeps the smallest faithful sentinels for serious, durable risk. | Greenfield work, fast-moving products, costly suites. |

All modes verify the change. All preserve protection when high impact is
plausible but unresolved. The modes change the admission threshold for permanent
tests, not the duty to find out whether the software works.

## How it works

Before admitting a permanent test, Mullet asks six questions:

1. What exact defect could ship?
2. What reachable production task, actor, and concrete consequence make it real?
3. What observable contract should survive implementation changes?
4. Why will nearby coverage miss it?
5. Will this test reliably detect that defect?
6. Do impact and likelihood repay maintenance and runtime?

It then climbs only as far as necessary:

1. Verify only when no durable consequence exists.
2. Add nothing when existing coverage already catches the failure.
3. Extend the closest durable test when it can absorb the case.
4. Use a cheaper test only when it preserves the real failure boundary.
5. Add one new behavioral regression test only when nothing else protects the
   consequential gap.

Existing tests have a stricter removal gate than new tests have for creation.
Before recommending `Candidate for removal`, Mullet must find positive evidence
that no unique durable behavior remains after inspecting production reachability,
overlap, and available comments, issue links, blame, or commits. For credible
material or serious paths with missing evidence, it preserves or escalates
instead of deleting.

## What passes the ladder

- A new idempotency boundary can double-charge customers, no existing test
  exercises retries, and a real database is required to expose the race:
  **add one faithful regression test**.
- A shared authorization rule exposes records across tenants and the current
  policy test covers nearby roles: **extend the existing policy test**.
- A currency conversion changes stored cents into displayed decimal values:
  **protect the financial invariant at the smallest faithful boundary**.
- A helper named `calculateAccountRisk` belongs to an abandoned admin prototype,
  has no reachable consumer, and duplicates no production contract:
  **verify it if changed, but add no permanent test**.

What does not pass:

- Exact helper calls, imports, private method names, or source strings.
- Cosmetic wording or markup with no accessibility, legal, localization, SEO,
  deployment, or compatibility contract.
- A new test only because the diff is large or coverage decreased.
- One speculative test for every branch of an interface that is still changing.
- A duplicate test at the same failure boundary with the same consequence.

Financial, authentication, authorization, security, privacy, migration, and
concurrency terminology triggers deeper inspection. It is not evidence by
itself. Mullet must establish a real production task, concrete consequence,
credible exposure, durable boundary, and unique protection before accepting a
permanent test.

See [examples/README.md](examples/README.md) for all five rungs and edge cases.

## Cursor audits and automations

Use the explicit audit skill for a named area:

```text
/mullet-audit full on packages/billing
```

Or audit the entire application:

```text
/mullet-audit ultra across the entire application
```

The audit is report-only. For whole applications, it maps behavioral
partitions, runs up to four area auditors concurrently, reviews overlap, and
challenges any verdict that relies on a high-risk label instead of evidence.
It reports actionable findings, aggregate verdict counts, and whether the audit
was complete or sampled.

The core `mullet` skill is the canonical decision policy for Codex, Claude, and
other skill-only clients. Cursor's bundled agents only add read-only
orchestration; package validation fails if they stop declaring the core policy
canonical.

Cursor Automations can run the same invocation on a schedule. See the
[ready-to-paste recipes](examples/cursor-automations.md) for scoped, baseline,
and incremental audits.

## Expected greenfield behavior

These are design targets, not measured claims:

- Volatile internals and cosmetic work receive disposable verification, not
  permanent tests.
- Behavior already protected by an existing user flow receives zero new tests.
- A stable high-risk gap receives one smallest faithful test.
- Refactors with unchanged behavior use existing coverage and add no tests.
- Existing fixtures and suites are extended before new test architecture is
  introduced.

The trigger benchmark and future longitudinal studies are designed to test
whether those outcomes hold. Mullet should be rejected or revised if it reduces
test count by suppressing consequential protection.

## Evidence from a large production suite

Mullet was applied to a mature event and commerce web application:

| Measure | Result |
|---|---:|
| Test files inspected | 683 |
| Declared test cases | 4,146 |
| Test code | 113,298 lines |
| Keep | 560 files (82.0%) |
| Mixed verdicts | 57 files (8.3%) |
| Consolidate | 30 files (4.4%) |
| Extend | 14 files (2.0%) |
| Candidate for removal | 22 files (3.2%) |

The useful signal was restraint. A sampled set of 11 high-risk tests covering
authorization, money, inventory, or data integrity was retained 11/11. In a
six-test low-value sample, only one source-coupled check survived; five produced
false alarms from harmless formatting changes.

The audit also exposed verification debt: the supported full-suite command
exceeded a five-minute limit, a direct parallel run produced no useful result
after eight minutes, and 28 discovered browser tests were all skipped while the
runner still exited successfully.

This is one private whole-repository case study, not a causal A/B experiment or
an independently reproducible benchmark. The public package includes aggregate
results but not proprietary file-level artifacts. Selection effects, approximate
case clusters, and the skill's effect on future churn require further
measurement. Full details are in
[the anonymized result](benchmarks/results/2026-07-24-suite-audit.md).

## Foundations

The runtime skill stays under 250 lines. Its decision rules are grounded in:

- *The Art of Software Testing* on defect discovery and test economics.
- Risk-based testing on impact and likelihood.
- *xUnit Test Patterns* on smells, brittleness, and maintainability.
- Google's guidance on scope, fidelity, and testing cost.
- Kent Beck's contextual, intention-revealing testing philosophy.

Read [the literature mapping](skills/mullet/references/foundations.md).

## Evaluate it

```sh
npm test
npm run check:decisions
npm run eval:decisions -- --model gpt-5.4 --runs 1
npm run eval:triggers -- --model gpt-5.4 --runs 3
```

The policy-fixture check is deterministic. The decision and trigger benchmarks
launch Codex in isolated temporary projects and may incur model usage. Trigger
runs record whether Mullet was read without being named; decision runs compare
observed structured verdicts with preregistered expectations.

Benchmark design, thresholds, and limitations are documented in
[benchmarks/README.md](benchmarks/README.md). The previous package evaluation
recorded 6/6 sampled decision matches under the v0.1 policy, while the
automatic-trigger evaluation failed at 7/8 correct completed runs, 20% observed
false activation, and two timeouts. Version 0.2 adds explicit fixtures for
high-risk adjacency, real exposure, consolidation, and existing-test deletion
sentinels; its deterministic policy check is part of `npm test`. Read the
[v0.2 diagnostic](benchmarks/results/2026-07-27-cursor-audit-evaluation.md) and
the historical
[v0.1 evaluation](benchmarks/results/2026-07-25-package-evaluation.md).

## License

[MIT](LICENSE)
