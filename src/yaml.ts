import { isAlias, isNode, parseDocument, stringify as serialize, visit } from "yaml";
import { OcvError } from "./standard.js";

export const MAX_INPUT_BYTES = 100_000;

export function parse(source: string): unknown {
  if (new TextEncoder().encode(source).byteLength > MAX_INPUT_BYTES) {
    throw new OcvError(`Input exceeds ${MAX_INPUT_BYTES} bytes.`);
  }
  const document = parseDocument(source, { version: "1.2", schema: "core", strict: true, uniqueKeys: true });
  const diagnostics = [...document.errors, ...document.warnings];
  if (diagnostics.length) {
    throw new OcvError(diagnostics[0].message, diagnostics.map((issue) => ({ code: "yaml", path: "", message: issue.message })));
  }
  visit(document, (_key, node) => {
    if (isAlias(node) || (isNode(node) && "anchor" in node && node.anchor)) throw new OcvError("YAML anchors and aliases are not supported.");
  });
  return document.toJS({ maxAliasCount: 0 });
}

export function stringify(document: unknown): string {
  const value = document && typeof document === "object" && !Array.isArray(document)
    ? { ocv: (document as Record<string, unknown>).ocv, ...document as Record<string, unknown> }
    : document;
  return serialize(value, { version: "1.2", aliasDuplicateObjects: false, lineWidth: 0 });
}
