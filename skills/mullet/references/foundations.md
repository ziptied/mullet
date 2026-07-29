# Mullet foundations

Use these principles to resolve ambiguous decisions and explain recommendations.
They justify the runtime gates; they do not replace repository evidence.

## Contents

- Purpose and economics
- Risk selection
- Maintainability and test smells
- Scope, size, and fidelity
- Context and durable simplicity
- Why the three intensities differ
- Precedence

## Purpose and economics

*The Art of Software Testing* frames testing as an attempt to expose errors,
not a demonstration that software works. Exhaustive testing is impossible, so
select cases with high defect-detection value under limited time and cost.

Mullet derives:

- Keep verification mandatory, but do not confuse a successful demonstration
  with valuable regression protection.
- Require a precise oracle: input plus expected observable result.
- Prefer cases likely to expose consequential defects over numerous easy cases.
- Judge coverage as evidence, never as the objective.

Sources:

- [The Psychology and Economics of Software Testing](https://www.oreilly.com/library/view/the-art-of/9781118133156/chapter02.html)
- [Test-Case Design](https://www.oreilly.com/library/view/the-art-of/9781118133156/chapter04.html)

## Risk selection

Risk-based testing prioritizes by both impact and likelihood or exposure. Impact
may be financial, operational, legal, safety-related, reputational, or harmful
to business objectives. Likelihood evidence includes frequency of use, change
surface, defect history, operational profiles, and sensitivity to similar
changes.

Mullet derives:

- Treat financial, authentication, authorization, privacy, security, and data
  labels as prompts to investigate, not substitutes for risk evidence.
- Establish a reachable production task and concrete consequence before calling
  behavior high impact.
- Protect demonstrated high-impact behavior even when its implementation is
  small.
- Treat large diffs as a reason for broader verification, not automatic tests.
- Give escaped and recurring defects more weight than imagined edge cases.
- Reassess regression value as risks, usage, and contracts change.
- Balance test selection with a manageable suite rather than maximizing count.

Source:

- [ISTQB Advanced Level Test Analyst syllabus](https://www.istqb.org/wp-content/uploads/sdm-uploads/ISTQB-CTAL-TA-Syllabus-v4.0-EN.pdf)

## Maintainability and test smells

*xUnit Test Patterns* catalogs warning signs such as fragile, obscure, slow,
duplicated, and over-coupled tests. A smell indicates maintenance risk or weak
diagnosis; it does not prove that the protected behavior is valueless.

Mullet derives:

- Repair or rewrite valuable smelly tests before considering removal.
- Prefer intention-revealing setup, action, and observable result.
- Consolidate only tests with the same failure boundary and consequence.
- Preserve complementary unit, integration, compatibility, and browser layers.
- Remove protection only when no unique durable behavior remains.

Source:

- [xUnit Test Patterns](https://xunitpatterns.com/)

## Scope, size, and fidelity

Google distinguishes test scope from execution size. Small tests are usually
faster and more deterministic, while larger tests provide fidelity unavailable
to units. Healthy suites blend scopes according to architecture and risk.
Stable tests exercise public behavior and survive implementation refactoring.

Mullet derives:

- Choose the smallest test that preserves the defect-producing boundary.
- Do not replace a database, process, framework, browser, or integration test
  with a unit test that cannot expose the same failure.
- Treat the test pyramid as a cost heuristic, not a quota.
- Treat slow or flaky valuable tests as engineering problems to repair.
- Report what verification actually ran; a passing smoke check is not an
  equivalent substitute for automated regression coverage.

Sources:

- [Testing Overview](https://abseil.io/resources/swe-book/html/ch11.html)
- [Unit Testing](https://abseil.io/resources/swe-book/html/ch12.html)
- [Larger Testing](https://abseil.io/resources/swe-book/html/ch14.html)

## Context and durable simplicity

Kent Beck argues that testing decisions are contextual and economic. Tests can
support confidence and future change, but the right investment differs between
an exploratory product and a long-lived stable system. Desirable unit tests are
behavioral, structure-insensitive, deterministic, specific, fast, writable,
readable, and predictive; no single property overrides all others.

Mullet derives:

- In volatile greenfield work, verify provisional behavior without freezing
  every internal boundary into permanent coverage.
- Graduate checks when contracts stabilize, risk becomes consequential, defects
  recur, or manual verification becomes repeatedly expensive.
- Preserve clear executable examples when they document a stable public
  contract for future consumers.
- Let temporary TDD checks inform design even when they do not all graduate;
  design learning and permanent regression economics are separate decisions.
- Prefer simple tests whose intention and failure are obvious.
- Optimize validated learning and durable confidence per unit of maintenance.

Sources:

- [To Test or Not to Test?](https://newsletter.kentbeck.com/p/to-test-or-not-to-test-thats-a-good)
- [Desirable Unit Tests](https://newsletter.kentbeck.com/p/desirable-unit-tests)

## Why the three intensities differ

The modes express different tolerances for omission risk, not different beliefs
about verification:

- **Lite / rigorous** favors protection when the regression and consequence are
  concrete but historical evidence is incomplete. It suits mature products,
  regulated work, and teams that prefer a somewhat denser safety net.
- **Full / balanced** applies risk-based selection and test economics directly.
  A documented new contract plus credible production exposure is positive
  evidence; lack of escaped defects is not evidence of safety. It is the
  default for ordinary product development.
- **Ultra / canary** favors a sparse set of high-signal sentinels. It suits
  volatile greenfield work and costly suites, but still preserves the smallest
  faithful invariant for serious risk.

The test pyramid informs cost and feedback speed. It does not prescribe a fixed
count or override the failure boundary. Canary mode is therefore minimal, not
unit-only.

## Precedence

When principles pull in different directions:

1. Resolve credible high-impact uncertainty on a reachable production path.
2. Test the smallest stable invariant at the cheapest faithful boundary.
3. Require a reliable oracle and unique coverage gap.
4. Prefer revision or consolidation over deletion.
5. Under unresolved credible material uncertainty, ask or preserve.
6. Under low-impact uncertainty, verify and add no permanent test.
7. Under mere high-risk adjacency without a real consequence, verify and do not
   preserve speculative protection.
