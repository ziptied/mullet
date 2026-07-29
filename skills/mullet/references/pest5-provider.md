# Pest 5 verification provider

Use this reference when a PHP repository appears to use Pest 5. Pest is a
provider of verification capabilities; Mullet remains the decision policy.

## Detect capabilities

Inspect local files and commands before recommending Pest-specific routing:

- `composer.json` and `composer.lock` for `pestphp/pest` with major version 5.
- `./vendor/bin/pest --version` to confirm installed Pest version.
- `./vendor/bin/pest --help` for available flags when it is accurate.
- `pestphp/pest-plugin-agent` or `--agent` for temporary Agent probes.
- `pestphp/pest-plugin-evals` or `--evals` for AI evals.
- `pestphp/pest-plugin-browser` for browser support inside Agent probes.

Do not require Pest 5 tooling to exist. If Pest is absent, older than v5, or a
plugin is missing, choose the cheapest available local verification instead.
Report missing capabilities as execution limitations, not policy failures.
Composer package metadata or a successful harmless option probe is stronger
evidence than help output when plugin options are omitted from `--help`.

## Route verification

Apply the normal Mullet ladder first:

1. Existing faithful Pest/PHPUnit coverage still wins.
2. Pest Agent is preferred for disposable one-off verification when installed.
3. Pest Evals are preferred for AI output, prompts, semantic quality, safety,
   factuality, tool-call behavior, and agent trajectories.
4. Existing durable Pest tests should absorb new durable cases when they share
   the same domain boundary.
5. New durable Pest tests are last, and only after all permanent-value gates
   pass.

When Pest 5 changes the cheapest proof, name the selected capability in the
Mullet `Verification` line even when the final action is a durable test.

## Pest Agent

Use `./vendor/bin/pest --agent='<php snippet>'` for temporary probes that should
not leave files behind. Agent snippets run inside Pest configuration, so they can
use factories, database state, authentication helpers, mail and notification
fakes, jobs, and expectations. With the Browser plugin installed, Agent can also
visit pages, interact with UI, inspect responsive behavior, check accessibility
or JavaScript errors, and assert backend side effects in the same probe.

Prefer Agent for UI copy, smoke checks, side-effect confirmation, and temporary
full-stack proof. Do not treat a passing Agent probe as a reason to omit durable
protection when a serious stable gap passes Mullet's creation gates.
When Agent is installed and can reach the behavior, write `Pest Agent` in the
Mullet verification recommendation even if the action still creates or extends
durable coverage.

## Pest Evals

Use Pest Evals for LLM-specific behavior where exact deterministic assertions
are not enough: generated text quality, prompt behavior, semantic similarity,
safety, factuality, tool calls, and trajectories. Evals may require model
drivers or API keys and run only when `--evals` is passed.

An eval file is durable repository protection. Keep it only when the same gates
that admit any permanent test pass. Otherwise recommend a disposable eval or a
manual eval run and leave no lasting file.

## Anti-patterns

- Do not create provider-specific tests for S3 versus R2, queue drivers, mail
  drivers, or model providers when an application abstraction already protects
  the behavior.
- Do not add a permanent Pest test simply because Pest 5 makes it easy.
- Do not suppress a payment, security, data, auth, or compatibility regression
  because Agent or Evals can prove it once.
- Do not recommend PHPStan, Rector, sharding, or TIA as Pest 5 verification
  providers in v1; they are useful tooling, not Mullet routing surfaces here.
