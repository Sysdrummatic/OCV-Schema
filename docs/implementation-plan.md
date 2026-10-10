# OCV Schema — implementation plan

Status: the local 1.0.0 foundation is implemented. No npm release or website
deployment has been performed.

## Progress — 2026-10-11

- [x] Specification, JSON Schema 1.0.0, examples and conformance fixtures.
- [x] Offline library, TypeScript types, CLI and migration registry.
- [x] English static demo, Basic visual style, form/YAML editing and QR codes.
- [x] CI and manually triggered GitHub Pages configuration.
- [x] Foundation verification: 34 tests, lint, types, builds and package installation.
- [ ] Complete browser file import/download checks.
- [ ] Release review, npm publication and GitHub Pages deployment.
- [ ] OpenCiVera pilot, followed by mapping-based export.

See the [validation report](validation.md) for results and limitations.

## Purpose and agreed decisions

OCV Schema is an open specification for one CV, independent of OpenCiVera.
The dedicated repository contains the specification, JSON Schema, reference
tools and examples. License: Apache-2.0. First format version: `1.0.0`.
Repository name: OCV-Schema; npm package name: `ocvschema`.

OpenCiVera is the intended first consumer. Conformance does not require an
OpenCiVera account or service. OpenAPI informs the project organization:
versioned specification, formal constraints, extensions, documentation and
implementations. The structural foundation is JSON Schema 2020-12.

The interface and project documentation are English, intended for developers
implementing tools. CV content may use any language. The format does not
declare a document language; consumers manage it separately.

## Contract 1.0.0

- A document contains `ocv: "1.0.0"` and `person`.
- No document-level language identifier is included. `languages` describes the
  person's language skills.
- `person` contains `first_name`, `family_name` and optional `brand_initials`.
  Both name fields are strings; at least one contains non-whitespace text.
- `summary`, `contact`, `qr_codes`, `skills`, `tech_stack`, `languages`,
  `interests`, `experience`, `education`, `courses` and `gdpr_clause` are
  optional. Every present section and entry must have the correct structure.
  Empty array sections use `[]`.
- Existing OpenCiVera field names and types are retained; `contact.link` is
  optional. `entry_id` and `__ocv` are not standard fields.
- `period` remains free text. `level` is an integer self-assessment from 1 to 5,
  with no automatic CEFR equivalence. `year` is a nonnegative integer.
  `qr_codes[].size` is an integer from 60 to 400 CSS pixels.
- `default` is boolean. At most one summary may have `default: true`.
  Initials and QR size are presentation hints; the application chooses a
  visual style independently of the CV document.
- Unknown fields are errors except `x-*` object extensions. Extension values
  must be JSON-compatible. Their authors document meaning and disclosure rules.
- YAML 1.2 and JSON represent the same model. The reference serializer puts
  `ocv` first; key order is not a conformance requirement.
- Validation does not modify input. An empty editing scaffold is not
  necessarily a conforming CV: ratings of 0, QR size 0 and two empty names
  are invalid.

## Versioning and migrations

Format and library versions are independent. A tool fix need not change `ocv`.
Each library release identifies the default creation/save version and includes
schemas for the supported earlier formats.

- `validate(document)` selects the schema from `ocv`.
- `migrate(document)` validates the source, applies supplied successive
  migrations to the library's default version, validates each result and
  returns a new document with versions, change status and warnings.
- Migration does not mutate input, silently discard extensions or accept
  unknown versions. In 1.0.0 it validates and deep-copies the document; there
  is no invented public 1.1.0 release.
- A dependency upgrade can change the default migration target. Installation
  does not rewrite a database: consumers call migration at import/save
  boundaries. New libraries retain earlier-format reading support.
- Major changes the contract; minor adds optional capabilities; patch clarifies
  documentation without changing document validity. Released schemas are immutable.
- Each new format requires migration steps, regression fixtures and a changelog
  entry. Older validators are not required to understand future versions.

## Library and CLI

The single `ocvschema` package provides schemas, generated TypeScript types,
JS/TS validation, YAML parsing/serialization and the `ocv` CLI.

- Ajv validates the formal schema. Separate `lint(document)` warnings do not
  change structural conformance.
- Diagnostics contain a stable code, JSON Pointer and readable message.
- `ocv validate cv.yaml` and `ocv lint cv.yaml` support text and `--format json`.
  Exit codes: 0 success, 1 invalid data, 2 usage/I/O failure. `ocv migrate`
  writes stdout and does not overwrite the input file.
- The parser rejects duplicate keys, anchors/aliases, custom tags and multiple
  documents. Default input limit: 100,000 bytes. Cycles and excessive nesting
  must not cause unbounded validation.
- Schemas ship in the package; validation works offline.
- `yaml.schemas` configuration provides editor diagnostics. Stricter application
  policies do not redefine OCV conformance.
- CLI capabilities and exact option syntax are documented in the
  [integration guide](integration.md#cli-and-ci).

## Static website and demonstration editor

React, TypeScript and Vite produce a static GitHub Pages site. The base path
is `/OCV-Schema/`. GitHub Actions prepares artifacts; initial publication is a
separate step after local validation.

- Documentation and versioned schemas are static assets.
- The CLI tab documents every current command, setup, JSON diagnostics,
  migration output, input limits and CI exit codes. It supports a direct
  `#cli` link and preserves CV edits when returning to Editor.
- Specification displays the complete CV YAML and links to the formal contract.
  Editor, CLI and Specification open from the top on navigation and reload;
  earlier `#workspace` and `#ocv-cli` links remain supported.
- The full form, YAML editing, diagnostics, QR and preview run in the browser.
  CV data is not sent to a server or automatically persisted. Files are opened
  and downloaded locally.
- The initial template is the **Basic visual style**. Future templates represent
  different visual styles. Column count is an internal responsive layout
  detail. Template selection is outside the CV schema and does not change CV data.
- Invalid YAML remains editable; the form cannot overwrite malformed input,
  and the last valid preview is marked as stale.
- English interface, light/dark themes, keyboard access and responsive layout.
- Text is rendered as text; active links use allowed protocols. Conformance
  does not replace renderer security.
- The OpenCiVera link leads to the full product. The demo does not export
  HTML/PDF. SDK and CLI remain useful independently of the website.

## OpenCiVera pilot — next milestone

After stabilizing the package, add an adapter between the existing model and
OCV. The proposed `/api/resume/export/ocv` uses the published snapshot resolver
and saved selection. Import detects `ocv`, validates, migrates and uses the
existing import review. Private identifiers remain internal; public extensions
require an explicit export policy.

Editable CVs may migrate on save. Historical publications remain immutable.
An npm library does not replace database authorization. Update Phase O and the
contract documentation, including the existing restriction against changing
YAML shape. This is a separate implementation and rollout in OpenCiVera.

Mapping-based export follows later with an approved mapping, initially JSON
Resume. It reports omissions, ambiguities and loss.

## Sequence and acceptance criteria

1. Specification 1.0.0, JSON Schema, valid/invalid examples and tests.
2. Library, generated types, CLI and future migration mechanism.
3. Static demo, integration documentation and GitHub Pages configuration.
4. Stable package and website publication after review.
5. OpenCiVera pilot, followed by mapping-based export.

Check complete entry structures, ranges, extensions, versions, input immutability,
offline behavior, safe parsing, CLI and migrations, including explicitly synthetic
future-version fixtures. Verify generated-type reproducibility and installation
in a second project. Browser checks cover desktop/mobile, English copy, Basic,
keyboard access and both themes. The pilot additionally covers save/import/export,
selection, inactive publications, privacy boundaries and the OpenCiVera suite.

## Sources

- [OpenAPI](https://spec.openapis.org/oas/v3.2.1.html)
- [JSON Schema](https://json-schema.org/specification)
- [JSON Resume](https://jsonresume.org/schema)
- [Ajv](https://ajv.js.org/json-schema.html)
- [YAML Language Server](https://github.com/redhat-developer/yaml-language-server)
- [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [Vite deployment](https://vite.dev/guide/static-deploy.html#github-pages)
- [OWASP XSS](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
