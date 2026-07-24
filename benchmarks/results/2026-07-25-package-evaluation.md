# Package evaluation

Date: 2026-07-25 JST  
Codex CLI: 0.142.1  
Model: gpt-5.4  
Skills CLI: 1.5.20

This report separates package correctness, decision quality, and automatic
activation. Passing one does not imply the others.

## Package

- Official skill validator: pass.
- Local package validator: pass.
- Skills CLI discovery: one skill found, no warnings.
- Skills CLI rendering: full runtime prompt and reference directory resolved.
- Runtime prompt: 231 lines, inside the 150–250 line budget.

## Decision diagnostic

Six model-backed scenarios were run once each after calibration:

| Scenario | Mode | Expected | Observed |
|---|---|---|---|
| Volatile cosmetic wording | full | Verify only | Verify only |
| Payment callback idempotency | full | New faithful regression test | New faithful regression test |
| Planned integration, exposure unknown | full | Pending: ask or preserve | Pending: ask or preserve |
| Planned integration, exposure unknown | ultra | Pending: ask or preserve | Pending: ask or preserve |
| Stable, cheap, recurring internal cost | full | New behavioral test | New behavioral test |
| Same recoverable inconvenience | ultra | Verify only | Verify only |

Result: **6/6 verdicts matched; zero high-risk suppression errors.**

This is a diagnostic subset with one run per scenario, not the full 17-scenario,
three-run benchmark. It demonstrates that the three mode boundaries can affect
decisions and that unresolved material risk is preserved, but it does not
estimate general accuracy.

## Automatic-trigger evaluation

The final description was followed by a 10-prompt post-tuning evaluation.
Prompts never named Mullet. This was not a statistically clean holdout because
the package author wrote the prompts and changed the split during development.
The isolated fixture included a minimal language project, the installed skill,
and the lock-manifest shape produced by the Skills CLI.

| Measure | Result | Threshold |
|---|---:|---:|
| Completed runs | 8/10 | 10/10 |
| Correct among completed | 7/8 (87.5%) | 90% |
| Implicit feature/bug/refactor activation | 3/3 (100%) | 80% |
| Explicit activation observed | 0/2 (0%) | 100% |
| False activation observed | 1/5 (20%) | ≤10% |
| Timed out | 2/10 | 0 |

Result: **fail**. The portable skill met implicit activation but missed one
completed suite-audit prompt, loaded for one educational reading-list prompt,
and had two process timeouts. A single run is also below the planned three-run
protocol.

Earlier tuning diagnostics improved from 3/4 to 4/4 after the description
front-loaded feature, bug-fix, refactor, and greenfield intent. A non-software
“Test Kitchen” false activation led to an explicit non-software/marketing
exclusion. These iterations are why the later run must not be called an
independent holdout.

## Interpretation

Mullet helps as a decision policy when it is loaded: the sampled evaluation
rejected cosmetic weight, protected financial idempotency, preserved unknown
material risk, and separated balanced from canary behavior. The large private
suite audit independently showed conservative retention of sampled high-risk
coverage and identified source-coupled false alarms.

It does **not** yet prove reliable automatic enforcement. Global installation
and an intent-rich description provide the strongest portable Agent Skills
mechanism, but invocation competes for a limited skill-description context and
remains agent-dependent. Projects that require Mullet on every testing decision
should invoke it explicitly. A future optional Codex plugin or pre-test hook is
justified only if repeated three-run benchmarks confirm that portable discovery
stays below threshold.

## Release recommendation

Suitable for an **experimental public preview** with the invocation limitation
visible. Not suitable to advertise as guaranteed automatic prevention of test
bloat. Do not claim causal reductions in greenfield churn until a longitudinal
A/B study measures permanent test creation, escaped consequential defects, and
test-only churn.
