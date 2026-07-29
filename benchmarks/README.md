# Mullet benchmarks

Mullet uses three complementary evaluations.

## 1. Package validation

`npm test` checks that:

- exactly two valid skills are distributed;
- the core runtime prompt remains between 150 and 250 lines;
- the Cursor plugin manifest and read-only audit agents are discoverable;
- the Cursor audit skill and agents declare the base skill as canonical policy;
- referenced files and installation examples resolve;
- benchmark fixtures are internally consistent;
- private source identifiers and stray operating-system files are absent.

## 2. Decision policy and model evaluation

`npm run check:decisions` validates preregistered expected rungs and policy
invariants. `npm run eval:decisions -- --model gpt-5.4` then loads Mullet in
isolated Codex tasks, requests structured verdicts, and compares observed
decisions with those expectations. Use `--limit` or `--ids` for diagnostics.
Verdicts and final rungs are strict. Rung 4 selects the cheapest faithful scope;
a newly created test must finish at rung 5.

Fixtures include financial, authorization, accessibility, cosmetic, refactor,
duplicate, flaky, integration, greenfield, external-index, compatibility, and
existing-test deletion cases. They distinguish domain adjacency from
demonstrated consequence, exposure, and unique protection. Suppressing a
demonstrated serious gap or preserving a no-consequence fixture is a hard
failure.

## 3. Automatic-trigger benchmark

`npm run eval:triggers -- --runs 3` launches Codex in a temporary isolated
project with a minimal language fixture for each prompt and records whether it
reads Mullet without the prompt naming Mullet. Failed or timed-out Codex
processes are reported separately. Any observed load counts toward activation
and false-activation rates even when the process later times out; completed-run
classification is reported separately.
The fixture copies the local skill and writes the same project lock-manifest
shape produced by the Skills CLI so Codex indexes it as installed.

Use `--split train`, `--split validation`, `--limit 4`, or a comma-separated
`--ids id-one,id-two` list for a smaller diagnostic run. Do not interpret a
diagnostic subset as the full benchmark.

The current split supports future repeated evaluation. The pre-release run was
not a statistically clean holdout: prompts were authored by the package author
and the split changed during harness and description development. Treat its
result as a post-tuning evaluation, not an unbiased accuracy estimate:

- `triggers.train.json`: 14 prompts, balanced positive and negative.
- `triggers.validation.json`: 10 post-tuning prompts, balanced positive and
  negative.

Prompts span JavaScript, Python, PHP, Go, Rust, and Java. Positive prompts cover
features, bug fixes, refactors, TDD, snapshots, fixtures, flaky tests, CI, and
suite audits. Negative prompts are close non-actionable requests such as testing
education, terminology, summaries, and prose.

Success thresholds:

- explicit test-changing prompts: 100% activation;
- implicit feature, bug-fix, and refactor prompts: at least 80%;
- validation set overall: at least 90%;
- negative-prompt false activation: at most 10%;
- no false suppression of demonstrated serious protection;
- no protection admitted solely from financial, auth, security, or similar
  domain adjacency.

Tune only against the training split, for no more than five description
revisions. Record the date, model, Codex version, and installation method. If the
portable skill remains below threshold, report that limitation; hooks or
agent-specific plugins belong in a future optional distribution, not hidden in
the benchmark.

## Interpreting results

Activation is necessary but insufficient. A skill that always activates can
still make expensive mistakes. The suite case study provides ecological
evidence, decision fixtures protect policy, and trigger prompts test discovery.
A future greenfield A/B study should measure:

- permanent tests created per consequential behavior;
- escaped consequential defects;
- test-only churn after product changes;
- runtime and maintenance burden;
- false suppression of demonstrated serious protection;
- false preservation of high-risk-adjacent tests with no real production
  consequence or unique gap.

Directional targets are 40% fewer permanent tests for low-risk volatile work,
30% less test-only churn, zero missed seeded serious defects, zero false
suppression of demonstrated serious protection, and zero protection accepted
from domain labels alone. These are preregistered targets, not current results.
