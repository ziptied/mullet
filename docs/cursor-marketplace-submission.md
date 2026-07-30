# Cursor Marketplace Submission

Use this as the release checklist and listing copy for submitting Mullet to the
Cursor Marketplace.

## Listing Details

| Field | Value |
|---|---|
| Plugin name | `mullet` |
| Display name | Mullet |
| Category | Developer Tools |
| Homepage | https://mulletest.dev |
| Repository | https://github.com/ziptied/mullet |
| License | MIT |
| Logo | `assets/logo.svg` |
| Components | Agent Skills and read-only audit agents |

## Short Copy

Create tests that repay their maintenance.

## Marketplace Description

A tiny Agent Skill that verifies every change and keeps lasting regression
coverage only when it protects a real, durable risk.

## Long Description

Mullet helps coding agents separate proof that a change works today from
regression protection worth carrying for years. It pushes back on prompt-shaped
test debt by requiring every permanent test to name a durable risk, concrete
consequence, stable contract, coverage gap, reliable oracle, and maintenance
economics.

The base skill works in Cursor, Codex, Claude, and other Agent Skill clients.
The Cursor plugin adds read-only scoped and whole-application audits through
bundled agents that map behavior, review overlap, and challenge risky deletion
recommendations without changing files.

## Key Benefits

- Verify every change without turning every verification into permanent test
  infrastructure.
- Keep the smallest faithful sentinel for serious, durable risk.
- Consolidate overlapping low-signal checks when one behavioral test protects
  the same failure.
- Preserve existing production, data-integrity, authentication, compatibility,
  and external-integration sentinels unless positive removal evidence exists.
- Run report-only Cursor audits with `/mullet-audit`.

## Validation Checklist

- `npm test`
- `npm run check:decisions`
- `npm run eval:decisions -- --model gpt-5.4 --runs 1`
- `npm run eval:triggers -- --model gpt-5.4 --runs 3`
- `npm pack --dry-run`
- Local Cursor smoke test against the latest app build.

## Local smoke preflight

Smoke-test by copying the plugin into `~/.cursor/plugins/local/mullet` (see
README; Cursor rejects out-of-tree symlinks), reload Cursor, then run
`/mullet-audit`. Do not use Cursor's marketplace or local folder import picker
against this checkout; that path treats the repo as a marketplace source and is
the wrong install for a single-plugin package.

## Submission Notes

This is a single-plugin repository. Per Cursor's plugin template guidance, the
plugin manifest lives at `.cursor-plugin/plugin.json`. Do not add
`.cursor-plugin/marketplace.json`; that file is only for multi-plugin catalogs.
Submit the public GitHub repository at
[cursor.com/marketplace/publish](https://cursor.com/marketplace/publish).
