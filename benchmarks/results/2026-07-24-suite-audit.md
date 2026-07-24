# Anonymized production-suite audit

Date: 2026-07-24  
Mode: full (balanced)  
Scope: whole-repository static audit plus targeted execution  
System: mature event and commerce web application

## Inventory

| Measure | Count |
|---|---:|
| Test files | 683 |
| Declared test cases | 4,146 |
| Test code | 113,298 lines |

## File-level verdicts

| Verdict | Files | Share |
|---|---:|---:|
| Keep | 560 | 82.0% |
| Mixed verdicts within file | 57 | 8.3% |
| Consolidate | 30 | 4.4% |
| Extend | 14 | 2.0% |
| Candidate for removal | 22 | 3.2% |

No test was deleted automatically.

## Risk-preservation check

Eleven sampled files protecting authorization, financial calculations,
inventory, or data integrity were retained: 11/11.

Six low-value source-coupled checks were exercised against harmless formatting
changes. One survived; five reported failures despite unchanged behavior. Those
five were classified for revision, consolidation, or removal candidacy rather
than trusted as regression protection.

## Execution findings

- The supported full-suite command exceeded its 300-second limit.
- A direct parallel run produced no useful result after more than eight minutes
  and was stopped.
- The browser runner discovered 28 tests, skipped all 28, executed zero
  assertions, and still exited successfully.

These findings demonstrate that a green command is not necessarily evidence of
working protection and that runtime cost must be part of suite economics.

## Recommendation

Keep the high-risk core. Repair the browser-suite signal before relying on it.
Consolidate only repeated cases that protect the same failure boundary and
consequence. Review the 22 removal candidates manually with production paths and
history visible. Apply Mullet during future changes to prevent new
implementation-coupled tests from accumulating.

## Limits

This is a single private whole-repository audit, not a controlled causal study
or an independently reproducible public benchmark. Proprietary file-level
artifacts and repository revision are not distributed. Aggregate counts are
historical evidence; approximate case clusters are less reliable because
framework syntax and generated cases vary. The audit surfaced verification debt
but does not yet quantify Mullet's effect on future defect escape or test churn.
