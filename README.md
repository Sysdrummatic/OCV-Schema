# OCV Schema

An open, versioned format for a single CV. Apache-2.0.

**Current status:** local 1.0.0 candidate. The npm package and GitHub Pages site
have not been published. OpenCiVera integration is a later milestone.

## Start

Requires Node.js 22+.

```sh
npm install
npm run verify
npm run dev
```

Open `http://127.0.0.1:5173/OCV-Schema/` for the browser editor.
The demo processes CVs locally: form editing, YAML, validation, QR codes and
the Basic visual style. The interface is English, with light/dark themes.
CV content can use any language. The format does not include a document language identifier.
The **Editor**, **CLI** and **Specification** tabs open from the top of the page.
CLI explains every command, JSON output and CI exit codes at
`/OCV-Schema/#cli`. Specification presents the complete CV YAML at
`/OCV-Schema/#specification`, with links to the formal schema and full document.

## A minimal CV

```yaml
ocv: "1.0.0"
person:
  first_name: "Anna"
  family_name: ""
```

Sections are optional; every present entry is fully validated. Extensions use
`x-*`. Private application fields `entry_id` and `__ocv` are not standard fields.

## Library and CLI

```ts
import { parse, validate, migrate } from "ocvschema";

const document = parse(yamlText);
const result = validate(document);
if (result.valid) {
  const migrated = migrate(document);
}
```

Before npm publication, use `npm pack` to install the local package in a
consumer project. After installing it:

```sh
npx ocv validate cv.ocv.yaml
npx ocv lint cv.ocv.yaml --format json
npx ocv migrate cv.ocv.yaml > upgraded.yaml
```

Updating the library can change the default format version while retaining
schemas and migrations for earlier versions. Call migration at import/save
boundaries; package installation does not rewrite stored CVs. In 1.0.0,
migration validates and deep-copies without changing the version.

## Documentation

- [Implementation plan](docs/implementation-plan.md)
- [Specification](docs/specification.md)
- [JSON Schema 1.0.0](schemas/1.0.0/schema.json)
- [Integration, CLI, editor and GitHub Pages](docs/integration.md)
- [Local validation results](docs/validation.md)
- [Complete example](examples/full.yaml)
- [Portable conformance fixtures](tests/fixtures/conformance.json)
- [Changelog](CHANGELOG.md)

## Development

`npm run verify` checks generated types, lint, TypeScript, tests and both
package/site builds. `npm run generate:types` regenerates types from the
canonical schema. `npm run build:site` creates a static `site/` directory.

GitHub Pages publishing is a separate, manually triggered workflow. The schema
and browser tooling do not depend on an OpenCiVera account or service.

## Contributing and AI agents

Instructions for Claude Code and Codex live in [`CLAUDE.md`](CLAUDE.md),
[`AGENTS.md`](AGENTS.md) and [`.codex/instructions.md`](.codex/instructions.md).

Project elements use the `ocvs-<xyzt>-<rest-of-text>` naming, where `xyzt` is the
4-digit issue/PR number. Branches: `ocvs-0001-add-migration-registry`. Commits and PR
titles: `feat(ocvs-0001): Add migration registry`. See
[docs/git-workflow.md](docs/git-workflow.md).
