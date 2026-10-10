import { MAX_INPUT_BYTES, parse, stringify, validate, type Issue, type OcvDocument } from "../src/index.js";

export type Draft = Record<string, unknown>;
export function isRecord(value: unknown): value is Draft {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function inspect(source: string): { draft: Draft | null; cv: OcvDocument | null; errors: Issue[] } {
  try {
    const document = parse(source);
    const checked = validate(document);
    return { draft: isRecord(document) ? document : null, cv: checked.valid ? document as OcvDocument : null, errors: checked.errors };
  } catch (error) {
    return { draft: null, cv: null, errors: [{ code: "yaml", path: "", message: error instanceof Error ? error.message : "Unable to parse YAML." }] };
  }
}

export function updateSource(draft: Draft, path: readonly (string | number)[], value: unknown): string {
  const next = structuredClone(draft);
  let parent: Record<string | number, unknown> = next;
  for (const key of path.slice(0, -1)) parent = parent[key] as Record<string | number, unknown>;
  parent[path[path.length - 1]] = value;
  const source = stringify(next);
  if (new TextEncoder().encode(source).byteLength > MAX_INPUT_BYTES) throw new Error(`Input exceeds ${MAX_INPUT_BYTES} bytes.`);
  return source;
}

export function safeHref(value: string | undefined): string | undefined {
  if (!value) return;
  try {
    return ["https:", "http:", "mailto:", "tel:"].includes(new URL(value).protocol) ? value : undefined;
  } catch { return; }
}
