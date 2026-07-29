# Cursor audit and evidence-policy evaluation

Date: 2026-07-27 JST  
Package: 0.2.0  
Codex CLI: 0.142.1  
Decision model: gpt-5.4  
Skills CLI: 1.5.20

This diagnostic covers the new Cursor plugin structure and the policy boundary
between high-risk domain adjacency and demonstrated durable value.

## Package and plugin

- Deterministic package and policy checks: pass.
- Agent Skills discovery: two skills found (`mullet`, `mullet-audit`).
- Cursor plugin manifest: valid against Cursor's published plugin schema.
- Cursor audit agents: four discovered; all use `model: inherit` and
  `readonly: true`.
- Core runtime prompt: 250 lines.
- Read-only scoped audit smoke: complete through the documented sequential
  fallback; package and policy checks passed and no files were modified.

The installed Cursor CLI on the evaluation machine reports version
`2025.10.02-bd871ac`, which predates Cursor's plugin and custom-subagent
release. End-to-end plugin loading was therefore not claimed from that binary.

## Evidence-policy diagnostic

Four new model-backed scenarios were run once each:

| Scenario | Expected | Observed |
|---|---|---|
| Unreachable financial prototype test | Candidate for removal | Candidate for removal |
| Auth framework default covered by login flow | No permanent test | No permanent test |
| Equivalent authorization permutations | Consolidate | Consolidate |
| Planned payment adapter with unknown exposure | Pending: ask or preserve | Pending: ask or preserve |

Result: **4/4 matched; zero demonstrated-serious protection errors.**

The default-model attempt was invalid because the older Codex CLI selected a
newer model it could not run. Re-running with the repository's documented
`gpt-5.4` model completed successfully. This is a targeted diagnostic, not the
full 21-scenario repeated benchmark.

## Interpretation

The new policy can reject high-risk-adjacent tests without suppressing credible
material uncertainty. It also distinguishes already-covered auth behavior from
true gaps and consolidates equivalent serious cases. Cursor plugin structure is
validated statically; a current Cursor release is still required for an
end-to-end plugin and scheduled-automation smoke test.
