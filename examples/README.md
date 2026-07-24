# Mullet examples

These examples show where the five-rung ladder stops. Verification is required
in every case; the verdict concerns permanent regression coverage.

## Rung 1: verify only

**Change:** Replace “Buy now” with “Reserve” on an experimental card.

**Inspection:** The text is not a legal disclosure, localization key,
accessibility name, analytics contract, or supported selector. The experiment
will likely change again.

**Verdict:** Render and inspect the card. Add no permanent test.

**Why:** No consequential durable regression can be named.

## Rung 2: already covered

**Change:** Refactor the price formatter without changing its public output.

**Inspection:** Existing parameterized tests exercise supported currencies,
rounding, and negative values through the public formatter.

**Verdict:** Run those tests and add nothing.

**Why:** A new test would catch no unique failure.

## Rung 3: extend existing

**Change:** A new support role may view an account but may not edit it.

**Inspection:** The authorization suite already expresses the role matrix at
the policy boundary. The new role creates a consequential access rule.

**Verdict:** Add one row to the existing matrix.

**Why:** The stable business rule matters, but a new file and fixture do not.

## Rung 4: cheaper faithful proof

**Change:** An API must reject an expired signed token.

**Inspection:** No existing coverage protects this contract. A browser journey
could prove the behavior, but the failure is fully created and observed at the
HTTP boundary with the real signing library.

**Verdict:** Select the HTTP integration boundary at rung 4, then continue to
rung 5 to create the regression test.

**Why:** The cheaper test preserves the cryptographic and protocol boundary.

## Rung 5: create sufficient protection

**Change:** Retrying a payment callback can create a second charge.

**Inspection:** No existing coverage exercises retry idempotency. The defect has
a serious financial consequence, the idempotency key is a stable contract, and
the real database transaction is necessary to expose it.

**Verdict:** Add the smallest sufficient integration set. Here, one test that
submits the same callback twice and observes a single charge is sufficient.

**Why:** All six gates pass and no cheaper existing protection exists.

## A cosmetic change that is not cosmetic

**Change:** Alter the visible text associated with a form input.

If that text is also the accessible name, the observable accessibility contract
is consequential and stable. Verify with assistive-technology semantics and
extend the closest accessibility test if coverage is absent. Mullet challenges
the superficial label; it does not dismiss the underlying contract.

## Why duplicate high-risk tests may stay

An authorization unit test and a browser test can look repetitive while catching
different failures: one proves the policy rule; the other proves route wiring.
Preserve both when each detects a distinct consequential failure. Consolidate
only when boundary and consequence are truly the same.

## How modes differ on an uncertain but concrete risk

**Change:** A planned import validator rejects malformed partner records. The
schema is documented and malformed data could block an operations queue, but it
is not yet known whether the integration will enter production. No nearby test
covers the rule.

- `mullet lite` may add one focused contract test because the consequence and
  stable boundary are concrete and the missing likelihood evidence is
  uncontradicted.
- `mullet full` returns **Pending** and asks whether the integration will enter
  production. If yes, the
  documented contract and credible operational exposure justify protection even
  without incident history. If unknown, it does not silently suppress the test:
  it asks or preserves a provisional sentinel.
- `mullet ultra` also returns **Pending** while material exposure is unresolved.
  Once known, it keeps verification disposable unless strong evidence shows a
  serious recurring risk; if it does, it keeps one canary record rather than a
  broad malformed-input matrix.

For a stable report filter used weekly where an incorrect sort creates ten
minutes of manual resorting but is caught before customer harm, `full` may
retain one cheap behavioral example because real exposure and recurring cost
are established. `ultra` verifies the change but adds no permanent test because
the short recoverable delay is not serious enough for a canary.
