# OCV Schema — project instructions

## Working agreement

- Respond in Polish unless asked otherwise. Project docs, UI and code identifiers are English.
- Deliver the change through implementation and validation; decide routine, reversible matters independently.
- KISS, DRY: reuse existing code before adding abstractions or dependencies.
- Inspect the working tree before editing; preserve existing changes.
- Surface contradictions before acting: if a request conflicts with a written rule, ADR/spec or earlier decision, name the file/section, quote the rule, then either follow the request **and** update the rule, or keep the rule and say why.
- Follow [docs/git-workflow.md](docs/git-workflow.md): branches `ocvs-<xyzt>-<rest-of-text>`, commits `feat(ocvs-<xyzt>): Text of the commit`. Do not invent issue/PR numbers.
- Report what changed, what was checked, what was skipped, and whether work is local, pushed or released.

## Context

- Contract and rules: [docs/specification.md](docs/specification.md), [docs/validation.md](docs/validation.md), [docs/integration.md](docs/integration.md).
- Plan and status: [docs/implementation-plan.md](docs/implementation-plan.md) (dated; not proof of release).
- Layout: `schemas/` JSON Schema, `src/` library + CLI, `examples/`, `tests/` (+ `fixtures/conformance.json`), `web/` demo site, `scripts/`.

## Rules

- Node >= 22, ESM, strict TypeScript. Runtime deps stay minimal (`ajv`, `yaml`).
- Released schema contracts are immutable: change them only via a new version plus a migration. The current `schemas/1.0.0/` is an unpublished candidate and may be refined before its first release; update the specification, fixtures and generated types together.
- Types are generated: edit the schema, then run `npm run generate:types`; never hand-edit generated types.
- Validation works offline; no network access in the library or CLI.
- Bug fix or behavior change: add a failing test first (`tests/`), then the smallest fix. Spec changes update conformance fixtures.
- Before finishing code changes run `npm run verify` (types check, lint, typecheck, tests, build). Docs-only: check links and commands.
- No secrets in the repo. No npm publish or Pages deploy unless explicitly asked.

## Instruction maintenance

- `AGENTS.md` is the canonical entry point (Claude imports it); `.codex/instructions.md` is only a pointer. Keep details in linked docs.
- Do not add mandatory skills, agents or tools the environment does not provide.
