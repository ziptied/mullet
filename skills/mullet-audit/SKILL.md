---
name: mullet-audit
description: Run an explicit read-only Mullet audit over a named application area or the entire application, tracing production behavior to existing tests, missing durable protection, and consolidation opportunities. Use only when the user invokes `/mullet-audit` or directly asks to run a Mullet application or suite audit.
disable-model-invocation: true
---

# Mullet audit

Audit application behavior and regression protection without editing the
repository. Read and apply the core [Mullet policy](../mullet/SKILL.md) and its
[foundations](../mullet/references/foundations.md) before dispatching work.
When Pest 5 is detected, also apply the
[Pest 5 provider reference](../mullet/references/pest5-provider.md).
The core Mullet skill is the canonical decision policy; this skill and the
Cursor agents only orchestrate read-only mapping, overlap review, and challenge
passes.
If a skill-only installation does not include those sibling files, continue
with the complete audit requirements below and disclose the fallback.

## Invocation

Accept natural-language invocations:

- `/mullet-audit full on packages/billing`
- `/mullet-audit ultra across the entire application`
- `/mullet-audit lite on authentication changes since the last successful run`

Inputs are:

- **Intensity:** `lite`, `full`, or `ultra`; default `full`.
- **Scope:** a path, named subsystem, or the entire application.
- **Window:** current checkout by default. In a recurring automation, use the
  last successful audited revision when available and inspect changed behavior
  plus nearby coverage. Never trust automation memory without checking the
  repository.
- **Budget:** an optional user-provided limit. If it prevents completion, report
  a sampled audit and name every omitted partition.

## Safety

This workflow is report-only.

- Do not create, edit, delete, or rename production or test files.
- Do not open a pull request or issue.
- Targeted test execution and other non-mutating verification are allowed.
- Never delete an existing test automatically. Report only candidates that pass
  the core existing-test removal gate.

## Workflow

### Scoped audit

1. Launch `mullet-area-auditor` for the requested scope.
2. Launch `mullet-overlap-reviewer` over the area findings and nearby coverage.
3. Launch `mullet-verdict-challenger` over every actionable or unresolved
   verdict.
4. Synthesize only findings that survive the challenge, including provider
   capability limits that materially affected verification.

### Whole-application audit

1. Launch `mullet-scope-mapper` to inventory production areas, tests, and
   meaningful boundaries, including Pest 5 or other provider capabilities.
2. Partition by production behavior, not arbitrary file counts. Keep coupled
   production and test paths together.
3. Launch one `mullet-area-auditor` per partition, with at most four running at
   once.
4. After all area handoffs arrive, launch one `mullet-overlap-reviewer` across
   the combined findings and provider-specific duplication concerns.
5. Launch one `mullet-verdict-challenger` over actionable and unresolved
   verdicts.
6. Mark the audit complete only when every mapped partition finished.

If the named custom agents are unavailable, perform the same phases
sequentially and disclose that no parallel subagents were used.

## Decision requirements

For every retained, extended, revised, consolidated, or removed test, establish:

1. a real reachable production task and affected actor or system;
2. an exact observable failure and concrete consequence;
3. credible use, exposure, history, consumer, or repeated verification cost;
4. a durable contract that should survive implementation changes;
5. a unique coverage gap or independently shippable failure boundary;
6. a faithful oracle whose value repays maintenance and runtime.

Money, authentication, authorization, privacy, security, migration, or
concurrency terminology triggers deeper inspection. It does not establish any
of the requirements above.

Use `Pending` only when a credible material production path exists but decisive
evidence cannot be obtained. Mere domain adjacency is not credible high-impact
uncertainty.

For `Candidate for removal`, require positive evidence that no unique durable
behavior remains after inspecting production reachability, overlap, and
available comments, issue links, blame, or commits. Cursor may parallelize this
work, but it must not apply a different decision policy.

## Output

Return:

1. intensity, scope, revision window, and `Complete` or `Sampled`;
2. verification performed and important execution limitations;
3. verdict counts for `Keep`, `Extend`, `Revise`, `Consolidate`,
   `Candidate for removal`, `Missing regression protection`, and `Pending`;
4. one row per actionable or pending finding with:
   - production task and actor;
   - failure and consequence;
   - exposure evidence;
   - durable boundary;
   - current coverage and overlap;
   - verdict, action, confidence, and removal evidence when applicable;
5. omitted partitions or evidence needed, if any.

Aggregate unchanged `Keep` results into counts. Do not emit thousands of
low-signal rows. Every consolidation must name the survivor and show that the
removed cases protect the same failure boundary and consequence. State
explicitly when the audit finds no actionable durable-value changes.
