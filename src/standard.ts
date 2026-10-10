import { Ajv2020 } from "ajv/dist/2020.js";
import type { AnySchemaObject, ErrorObject } from "ajv";

export type Issue = { code: string; path: string; message: string };
export type ValidationResult = { valid: boolean; errors: Issue[] };
export type MigrationResult<T = Record<string, unknown>> = {
  document: T;
  fromVersion: string;
  toVersion: string;
  changed: boolean;
  warnings: Issue[];
};
export type Release = {
  version: string;
  schema: AnySchemaObject;
  migrateToNext?: (document: Record<string, unknown>) => { document: Record<string, unknown>; warnings: Issue[] };
};

export class OcvError extends Error {
  constructor(message: string, readonly issues: Issue[] = []) {
    super(message);
    this.name = "OcvError";
  }
}

function isJsonValue(value: unknown, ancestors = new Set<object>(), depth = 0): boolean {
  if (depth > 64) return false;
  if (value === null || typeof value === "string" || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value !== "object" || ancestors.has(value)) return false;
  if (!Array.isArray(value) && ![Object.prototype, null].includes(Object.getPrototypeOf(value))) return false;
  ancestors.add(value);
  const valid = Object.values(value).every((entry) => isJsonValue(entry, ancestors, depth + 1));
  ancestors.delete(value);
  return valid;
}

function pointer(value: string): string {
  return value.replace(/~/g, "~0").replace(/\//g, "~1");
}

function diagnostic(error: ErrorObject): Issue {
  const missing = error.keyword === "required" ? String(error.params.missingProperty) : undefined;
  const unknown = error.keyword === "additionalProperties" ? String(error.params.additionalProperty) : undefined;
  const key = missing ?? unknown;
  return {
    code: error.keyword,
    path: error.instancePath + (key ? `/${pointer(key)}` : ""),
    message: error.message ?? "Invalid value.",
  };
}

export function createStandard(releases: readonly Release[]) {
  if (!releases.length || new Set(releases.map((release) => release.version)).size !== releases.length) {
    throw new Error("A standard needs uniquely versioned releases.");
  }
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validators = new Map(releases.map((release) => [release.version, ajv.compile(release.schema)]));
  const currentVersion = releases[releases.length - 1].version;

  function validate(document: unknown): ValidationResult {
    if (!isJsonValue(document)) {
      return { valid: false, errors: [{ code: "json-value", path: "", message: "Use finite JSON values without cycles or nesting deeper than 64 levels." }] };
    }
    const version = document && typeof document === "object" && !Array.isArray(document)
      ? (document as Record<string, unknown>).ocv : undefined;
    if (typeof version !== "string") {
      return { valid: false, errors: [{ code: "required-version", path: "/ocv", message: "ocv must identify the format version as a string." }] };
    }
    const validator = validators.get(version);
    if (!validator) {
      return { valid: false, errors: [{ code: "unsupported-version", path: "/ocv", message: `Unsupported OCV version: ${version}. Supported: ${releases.map((release) => release.version).join(", ")}.` }] };
    }
    const valid = validator(document) === true;
    return { valid, errors: valid ? [] : (validator.errors ?? []).map(diagnostic) };
  }

  function migrate(document: unknown): MigrationResult {
    const initial = validate(document);
    if (!initial.valid) throw new OcvError("Cannot migrate an invalid document or unsupported version.", initial.errors);
    let output = structuredClone(document) as Record<string, unknown>;
    const fromVersion = String(output.ocv);
    const warnings: Issue[] = [];
    for (let index = releases.findIndex((release) => release.version === fromVersion); index < releases.length - 1; index++) {
      const step = releases[index].migrateToNext;
      if (!step) throw new OcvError(`Missing migration from ${releases[index].version}.`);
      const result = step(output);
      output = result.document;
      const expected = releases[index + 1].version;
      if (output.ocv !== expected) throw new OcvError(`Migration must produce OCV ${expected}.`);
      const checked = validate(output);
      if (!checked.valid) throw new OcvError(`Migration to ${expected} produced an invalid document.`, checked.errors);
      warnings.push(...result.warnings);
    }
    return { document: output, fromVersion, toVersion: currentVersion, changed: fromVersion !== currentVersion, warnings };
  }

  return { currentVersion, supportedVersions: releases.map((release) => release.version), validate, migrate };
}
