# Integrating OCV Schema

The repository currently provides a local implementation, not a published npm
package. Start with `npm install`, then `npm run verify`.

## JavaScript / TypeScript

After publication, install `npm install ocvschema`. Before publication, use
`npm pack` and install the resulting `.tgz` in another project. The package is
ESM and supports Node.js 22+ and browser bundlers; the CLI requires Node.js.

```ts
import { validate, lint, migrate, parse, stringify } from "ocvschema";

const document = parse(yamlText);
const result = validate(document);
if (!result.valid) {
  console.error(result.errors);
} else {
  const warnings = lint(document);
  const upgraded = migrate(document);
  const yaml = stringify(upgraded.document);
  // Commit only after the application's own authorization and save checks.
}
```

Keep the dependency pinned through the lockfile. Validation chooses the schema
from `ocv`. Updating the package may introduce a new default migration target;
it does not automatically rewrite existing files or database rows. Applications
may impose stricter limits but must distinguish their policy from conformance.

The library does not send CVs over the network. Never embed secrets in a static
website. Do not copy private application metadata into public extensions.

## CLI and CI

The static website also provides a **CLI** tab at
`/OCV-Schema/#cli`, covering setup, all commands, output options and exit codes.
The earlier `#ocv-cli` link still opens the CLI tab.

```sh
npx ocv validate examples/full.yaml
npx ocv lint examples/full.yaml --format json
npx ocv migrate examples/full.yaml > upgraded.yaml
```

The installed binary is `ocv`; the package name is `ocvschema`. Use `npm exec
--package=ocvschema -- ocv validate cv.yaml` when running without a local
installation. Migrations write stdout, never overwrite their input. Exit codes:
0 success, 1 invalid data, 2 usage/I/O error. Lint warnings alone do not fail CI.

| Command or option | Current behavior |
| --- | --- |
| `ocv validate cv.yaml` | Validate YAML or JSON against its declared OCV version |
| `ocv lint cv.yaml` | Validate and report nonblocking warnings for links, periods and default summaries |
| `ocv migrate cv.yaml` | Validate and write the document in the library's default format to stdout |
| `--format json` | Return machine-readable diagnostics, or the migration document and report; place after the input file |
| `ocv --help` | Show usage |
| `ocv --version` | Show the library's current default OCV format version |

With only format 1.0.0 available, migration keeps the version and writes a
validated copy. Future releases supply successive migration steps. There is
currently no target-version flag, stdin input, rendering or export command.

## Editor validation

With the YAML extension installed, use a local schema in `.vscode/settings.json`:

```json
{
  "yaml.schemas": {
    "./node_modules/ocvschema/dist/schemas/1.0.0/schema.json": ["**/*.ocv.yaml"]
  }
}
```

Or add a modeline to a specific file:

```yaml
# yaml-language-server: $schema=./node_modules/ocvschema/dist/schemas/1.0.0/schema.json
ocv: "1.0.0"
person:
  first_name: "Anna"
  family_name: ""
```

Local paths avoid network dependency. Editor feedback is not a substitute for
server validation at trust boundaries.

## GitHub Pages

`npm run build:site` creates `site/`. The static build contains all browser
dependencies, the formal schema and sample CVs. The base path is `/OCV-Schema/`.
The site has no backend, account system, telemetry or automatic CV persistence.
Input files, validation, preview and QR generation remain in the browser.
The interface and project documentation are English. CV content may use any
language, without a document language identifier in OCV. The initial template is the Basic
visual style; additional styles are a later enhancement. Column count is an
internal responsive layout detail, not a template choice or a CV schema field.
Editor, CLI and Specification navigation opens from the top of the page,
including on reload and browser history navigation. The Specification tab at
`#specification` displays the full YAML example and links to the formal contract.

The included Pages workflow is manually triggered after enabling GitHub Pages
with GitHub Actions as its source. It verifies the project before publishing.
Deployment has not been performed as part of the local implementation.
