# OCV Schema 1.0.0

Status: locally implemented candidate. No public npm release has been made.
License: Apache-2.0.

## Purpose and normative contract

OCV Schema describes one CV. It is independent of
storage, authentication, publication, templates and the OpenCiVera service.
The terms MUST, MUST NOT, SHOULD and MAY express requirements and recommendations.
The [JSON Schema](../schemas/1.0.0/schema.json) is the authoritative structural
contract; this document specifies interpretation and processing requirements.
The schema uses JSON Schema 2020-12.

## Document identity

An OCV 1.0.0 document MUST be an object containing:

| Field | Type | Meaning |
| --- | --- | --- |
| `ocv` | string, exactly `1.0.0` | Version of the data format |
| `person` | object | The person represented by this CV |

`person.first_name` and `person.family_name` MUST be strings. At least one MUST
contain a non-whitespace character. Either may individually be empty. Optional
`person.brand_initials` is a display hint, not an identifier. Names MUST NOT be
assumed to uniquely identify people. The format does not declare a document
language. Applications manage language selection separately; `languages`
describes the person's language skills.

All sections below are optional. Present sections MUST match their declared
types; array sections MAY be empty. Present object entries MUST include all
listed fields except `contact.link`. Text fields MAY be empty unless stated
otherwise. `null` is not a substitute for an absent field or empty array.

| Section | Entry fields and types |
| --- | --- |
| `summary` | `position: string`, `description: string`, `default: boolean` |
| `contact` | `label: string`, `value: string`, optional `link: string` |
| `qr_codes` | `label: string`, `value: string`, `size: integer` (60–400) |
| `skills` | `name: string`, `level: integer` (1–5) |
| `tech_stack` | array of strings |
| `languages` | `name: string`, `level_text: string`, `level: integer` (1–5) |
| `interests` | array of strings |
| `experience` | `period: string`, `company: string`, `role: string`, `highlights: string[]` |
| `education` | `period: string`, `school: string`, `degree: string`, `detail: string` |
| `courses` | `year: integer` (at least 0), `name: string` |
| `gdpr_clause` | string, not an array |

At most one summary MUST have `default: true`. The standard does not require a
default: absence is valid but the linter warns when nonempty summaries lack one.
The reference preview displays only the explicitly selected default summary.

`period` is free text. Implementations MUST NOT claim that it can always be
converted into exact dates. Ratings 1–5 are self-assessments, not certifications
or CEFR equivalences. Year 0 represents an unspecified year; renderers SHOULD
omit it. QR values are payload strings, not image URLs; size is a preferred
square width in CSS pixels. A renderer MAY scale a QR for its layout.
`gdpr_clause` is plain text; its presence does not establish legal compliance.

## Extensions and privacy

Objects MAY contain extension properties matching `^x-.+`. Each extension MUST
contain JSON-compatible values. Other unknown properties are errors. In
particular, `entry_id` and `__ocv` are not standard fields.

Authors SHOULD namespace extensions (for example `x-example`). Implementations
MAY ignore their meaning but MUST NOT silently remove them during migration.
Preserving an extension is not permission to publish it. Applications MUST
apply their own ownership, selection and disclosure rules before public export.

## YAML, JSON and processing

YAML 1.2 and JSON represent the same data tree. Field names are case-sensitive.
Object key order is not part of conformance. The reference YAML writer places
`ocv` first. Text MUST be rendered as text, never automatically as executable
HTML, JavaScript or template code.

The reference parser accepts one document, rejects duplicate keys, anchors,
aliases and custom tags, and limits input to 100,000 UTF-8 bytes. Parsed values
MUST be JSON-compatible: no cycles, non-finite numbers or runtime objects.
The reference library rejects nesting beyond 64 levels. These resource limits
are implementation limits, not additional CV fields.

Validation MUST NOT modify input, fill defaults, coerce strings to numbers or
booleans, or remove unknown fields. A result contains `valid` and `errors`, each
issue having a stable `code`, JSON Pointer `path`, and human-readable `message`.

Lint is separate from structural validity. The reference linter warns about
links unsuitable for safe activation, free-text periods that do not match its
conservative date convention, and absent default summaries. Lint does not prove
the correctness of dates, URLs, ratings or claims. Renderers MUST independently
escape output and guard link protocols; schema validity is not an XSS defence.

## Versions and migrations

The format version in `ocv` is independent of the npm package version. A tool
fix can leave the format unchanged. Released schema artifacts MUST NOT change
in place. Major releases may break shape/meaning; minor releases add optional
features; patch releases clarify the specification without changing validity.

A newer library SHOULD retain all earlier release schemas and migration steps.
It validates a document against the version the document declares, not simply
against the latest shape. Unknown versions MUST fail explicitly. Old tools are
not required to understand future versions.

`migrate(document)` validates the source, clones it, runs successive release
migrations to the library's default version and validates each intermediate
result. It returns `{ document, fromVersion, toVersion, changed, warnings }`.
Invalid sources, missing steps or invalid results fail without committing
partial results. In 1.0.0, migration validates and deep-copies the document;
there is no invented 1.1.0 release.

Updating the dependency changes the default target only when that library
release introduces a new supported format. Installation does not rewrite a
database: consumers call migration at their import/save boundaries. Published
historical snapshots MUST NOT be silently rewritten. Migration chains are
tested with synthetic release fixtures, clearly separated from public releases.

## Conformance and release process

Portable fixture cases in `tests/fixtures/conformance.json` identify valid and
invalid data. Any implementation can run these fixtures. Passing them is
evidence for the covered cases, not an independent certification.

Before releasing a format change: propose the change in an issue/PR, describe
compatibility, add an immutable schema and migration, retain prior fixtures,
regenerate types, run verification and update the changelog. The initial
maintainer reviews releases; external consumers can contribute through GitHub.

JSON Resume conversion is a later mapping-based tool. A converter MUST report
unmapped, ambiguous or lossy data instead of promising lossless conversion.
