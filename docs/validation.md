# Local foundation validation

Date: 2026-10-11. Branch: `feat/ocv-schema-foundation`.
These results concern the local 1.0.0 candidate, not a published release.

## Foundation baseline

Before the English/Basic UI refinement, `npm.cmd run verify` passed:

- generated TypeScript reproducibility;
- ESLint;
- library and browser TypeScript;
- 34 tests without failures;
- package and static site builds.

Baseline tests covered section structures, extensions, the then-supported document language field, versions,
input immutability, YAML/JSON, parsing, limits and CLI diagnostics. Migration
chains use explicitly synthetic releases; the only actual format is 1.0.0.
The form model has isolated checks for preserving extensions, malformed source
and safe preview-link protocols.

`npm.cmd pack --json` produced a local package. It was installed in a separate
temporary consumer through `npm.cmd install ./ocvschema-1.0.0.tgz --ignore-scripts
--no-audit --no-fund`. Assertions confirmed ESM imports, `ocvschema/schema.json`,
validation, migration and YAML round-tripping. The installed binary
`node_modules/.bin/ocv.cmd validate minimal.yaml` also exited 0 with a valid CV.
The package contains integration docs and portable conformance fixtures.

Static assets and the `/OCV-Schema/` base path were checked. The specification
stays under `docs/` so its relative schema link works on GitHub Pages.

## Browser baseline

Chrome, local Vite server: `http://127.0.0.1:5178/OCV-Schema/`.

- Form edits update the preview; the sample QR is visible.
- Invalid YAML remains editable, disables download and prevents form overwrites.
  The preview is marked stale until the source is repaired.
- Light and dark themes work.
- At a 390 × 844 viewport, content width matched the available page width
  (375 pixels after allowing for the scrollbar).
- Tab moves focus with a visible outline.
- No console errors or warnings were recorded at the final baseline check.

The baseline also checked the former bilingual interface and column selector.
Those features were subsequently removed at the user's request. The current
contract is an English interface with one Basic visual style.

## English interface and Basic style refinement

The current interface and project documentation are English. The former column
selector was replaced with the single Basic visual style; its layout adapts to
screen width. At that stage, CV `locale` was independent of the interface language;
the field was removed in the subsequent contract refinement described below.

For this refinement, `npm.cmd run lint`, `npm.cmd run typecheck` and
`npm.cmd run build` passed. Chrome confirmed English navigation, a single Basic
option, form updates, both themes and visible keyboard focus. At 390 × 844,
the workspace and preview used one column and page width equalled content width.
Built CLI help, version, JSON lint and JSON migration were also checked.

No tests were added or rerun for this copy/presentation change. The 34-test
result above is the foundation baseline, not a new run for this refinement.

## OCV CLI website tab

For the CLI documentation tab, `npm.cmd run lint`, `npm.cmd run typecheck` and
`npm.cmd run build` passed. Browser checks confirmed:

- the command reference covers validate, lint, migrate, help, version and JSON output;
- switching to the CLI tab and back preserves edited CV fields;
- browser Back returns to the CLI tab and reloading its direct hash URL opens it;
- Skip to content moves keyboard focus to the CLI content with a visible outline;
- light/dark themes and a 390 × 844 mobile viewport work without page overflow;
- no console warnings or errors were recorded.

No unit tests were added or rerun for this documentation surface. CLI behavior
and the CV data contract were not changed.

## Editor, CLI and Specification navigation

The navigation labels are now Editor, CLI and Specification. Specification
renders the complete existing YAML example with every standard field and a
namespaced extension. Links to the raw YAML, JSON Schema and full normative
document remain available. No CV format or CLI behavior changed.

`npm.cmd run lint`, `npm.cmd run typecheck` and `npm.cmd run build` passed.
The build reports a JavaScript chunk-size warning (approximately 503 kB,
155 kB gzipped); it remains a successful build.

Chrome assertions confirmed top-of-page opening after reload for all three
views, top-of-page Back navigation and preservation of editor changes.
Earlier `#workspace` and `#ocv-cli` links still open the corresponding view at
the top. Every YAML section is visible in the reference. Skip to content moves
focus to the active content, and the specification works in both themes at a
390 × 844 viewport without horizontal page overflow. No console errors or
warnings were recorded. Unit tests were not added or rerun for this refinement.

## Removal of document language metadata

The user removed `locale` from the unpublished 1.0.0 candidate. Required root
fields are now `ocv` and `person`. Examples, generated types, the editor,
preview and specification were updated together. The existing language-tag
fixtures were removed and the former invalid-locale fixture now checks that
the removed field is rejected. Earlier drafts containing `locale` must remove
that field; validation and migration do not silently discard it.

The registry lookup `npm.cmd view ocvschema version repository.url --json`
returned E404 and the repository had no local or remote release tags. This
supports the documented candidate status; the stale AGENTS.md claim that
1.0.0 was already published was corrected. Released contracts remain immutable.

`npm.cmd run check:types`, `npm.cmd run lint`, `npm.cmd run typecheck` and
`npm.cmd run build` passed. CLI validation accepted both updated YAML examples.
A self-check against the built SDK confirmed the required fields, absence of
the schema property, `/locale` diagnostics for earlier drafts, input preservation
and identity migration. The successful build retains a chunk-size warning
(approximately 502 kB, 155 kB gzipped).

Chrome confirmed that Specification and Editor YAML omit the field, the form
has no Document language control, editing updates the valid preview and adding
`locale` reports an error that disappears after the field is removed.
Existing test inputs and fixtures were updated; the automated test suite was
not rerun. No public release or application/database migration was performed.

## Remaining checks and limitations

Automated Chrome file import was blocked by the extension's disabled access to
file URLs. Browser permissions were not changed. Download was clicked, but the
tool did not report a download event before the timeout; the saved file is
unconfirmed. These paths require manual review before release.

No npm publication, push, GitHub Pages deployment or OpenCiVera integration
was performed. There is no newer actual format to migrate to. Keyboard checks
are basic, not a complete accessibility or screen-reader audit.

During foundation work, lint and typecheck were accidentally run in adjacent
`plm-resume`: lint passed; typecheck reported errors in generated
`.next/dev/types/routes.d.ts`. This was not an OCV Schema gate. That file and
the adjacent application configuration were not changed.
