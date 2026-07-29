# Cursor automation recipes

Mullet audits are report-only. They inspect production behavior and tests,
perform non-mutating verification when useful, and return findings without
editing files or opening pull requests.

Install the Cursor plugin, then use Cursor's `/automate` skill or the Automations
UI to choose a repository and schedule. Paste one of the instruction blocks
below. The schedule itself belongs to the user's Cursor account and is not
stored in this repository.

## Recurring scoped audit

```text
/mullet-audit full on packages/billing since the last successful run.

Trace changed production behavior to nearby tests. Report missing durable
protection, tests that should be extended, true consolidation opportunities,
and removal candidates. Remain read-only. If automation memory contains the
last audited revision, verify that revision against git before using it. If no
successful revision exists, audit the current billing scope as a baseline.
```

Use this for a daily or weekly review of one high-change application area.

## Whole-application baseline

```text
/mullet-audit full across the entire application at the current revision.

Map every production area to nearby tests, audit each behavioral partition,
review overlap across partitions, and challenge every actionable verdict.
Remain read-only. Do not claim completeness unless every mapped partition
finishes; otherwise label the result Sampled and list all omitted areas.
```

Use this for an initial baseline or an occasional comprehensive review.

## Incremental whole-application audit

```text
/mullet-audit full across application behavior changed since the last successful
run, including nearby tests and shared rules affected by those changes.

Use automation memory only to locate the previous successful revision and
verify it against git. Remain read-only. Report the audited revision window,
actionable findings, aggregate verdict counts, and any scope that could not be
completed. Save the current revision to memory only after a successful report.
```

Use this for recurring whole-application coverage without repeatedly scanning
unchanged areas.

## Financial or authorization focus

```text
/mullet-audit ultra on financial and authorization behavior changed since the
last successful run.

Do not accept tests because their subject sounds high risk. For every Keep,
Extend, or Missing regression protection verdict, require a reachable
production task, affected actor, exact failure, concrete consequence, credible
exposure, durable boundary, unique gap, and faithful oracle. Search for
consolidation across equivalent cases. Remain read-only.
```

Use this when a sparse canary posture is desired for serious domains.

## Expected result

Every run should state:

- intensity, scope, revision window, and Complete or Sampled;
- verification performed and execution limitations;
- aggregate verdict counts;
- one row per actionable or pending finding;
- omitted partitions or evidence still required.

An empty actionable list is a valid result when the existing suite has durable,
non-duplicated protection.
