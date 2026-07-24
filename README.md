# Mullet

**Verify every change. Keep only tests that repay their maintenance.**

Status: experimental preview. Decision diagnostics are promising; automatic
invocation remains below the release threshold.

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

Skill activation remains the agent's decision. Global installation plus
Mullet's intent-rich description gives it the best portable chance of automatic
use. The current single-run post-tuning evaluation did not meet the
automatic-activation release threshold, so say `use mullet` when a particular
run must use it.

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
2. Who or what would suffer?
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

## What passes the ladder

- A new idempotency boundary can double-charge customers, no existing test
  exercises retries, and a real database is required to expose the race:
  **add one faithful regression test**.
- A shared authorization rule exposes records across tenants and the current
  policy test covers nearby roles: **extend the existing policy test**.
- A currency conversion changes stored cents into displayed decimal values:
  **protect the financial invariant at the smallest faithful boundary**.

What does not pass:

- Exact helper calls, imports, private method names, or source strings.
- Cosmetic wording or markup with no accessibility, legal, localization, SEO,
  deployment, or compatibility contract.
- A new test only because the diff is large or coverage decreased.
- One speculative test for every branch of an interface that is still changing.
- A duplicate test at the same failure boundary with the same consequence.

See [examples/README.md](examples/README.md) for all five rungs and edge cases.

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
[benchmarks/README.md](benchmarks/README.md). The latest package evaluation
recorded 6/6 sampled decision matches with no high-risk suppression, while the
automatic-trigger evaluation failed at 7/8 correct completed runs, 20% observed
false activation, and two timeouts. Read the
[full evaluation](benchmarks/results/2026-07-25-package-evaluation.md).

## License

[MIT](LICENSE)
