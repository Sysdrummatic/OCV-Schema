import schema from "../schemas/1.0.0/schema.json" with { type: "json" };
import { createStandard, type Issue, type MigrationResult } from "./standard.js";
import type { OcvDocument } from "./types.generated.js";

const standard = createStandard([{ version: "1.0.0", schema }]);

export const CURRENT_VERSION = standard.currentVersion;
export const SUPPORTED_VERSIONS: readonly string[] = Object.freeze(standard.supportedVersions);
export const validate = standard.validate;
export const schemaV1 = schema;
export function migrate(document: unknown): MigrationResult<OcvDocument> {
  return standard.migrate(document) as MigrationResult<OcvDocument>;
}
export function lint(document: unknown): Issue[] {
  if (!validate(document).valid) return [];
  const cv = document as OcvDocument;
  const warnings: Issue[] = [];
  cv.contact?.forEach((entry, index) => {
    if (!entry.link?.trim()) return;
    try {
      if (["http:", "https:", "mailto:", "tel:"].includes(new URL(entry.link).protocol)) return;
    } catch { /* A malformed URL is reported with the same diagnostic. */ }
    warnings.push({ code: "unsafe-link", path: `/contact/${index}/link`, message: "Use an absolute http, https, mailto or tel link for safe activation." });
  });
  for (const section of ["experience", "education"] as const) {
    cv[section]?.forEach((entry, index) => {
      if (entry.period.trim() && !/^\d{4}(?:-\d{2}(?:-\d{2})?)?(?:\s*[–—-]\s*(?:\d{4}(?:-\d{2}(?:-\d{2})?)?|present|obecnie))?$/i.test(entry.period.trim())) {
        warnings.push({ code: "unstructured-period", path: `/${section}/${index}/period`, message: "This free-text period may need a manual mapping when exporting to structured dates." });
      }
    });
  }
  if (cv.summary?.length && !cv.summary.some((entry) => entry.default)) {
    warnings.push({ code: "no-default-summary", path: "/summary", message: "Choose a default summary to make the intended display explicit." });
  }
  return warnings;
}

export { parse, stringify, MAX_INPUT_BYTES } from "./yaml.js";
export { OcvError } from "./standard.js";
export type { Issue, ValidationResult, MigrationResult } from "./standard.js";
export type * from "./types.generated.js";
