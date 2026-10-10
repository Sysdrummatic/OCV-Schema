#!/usr/bin/env node
import { open } from "node:fs/promises";
import { CURRENT_VERSION, MAX_INPUT_BYTES, OcvError, lint, migrate, parse, stringify, validate } from "./index.js";

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === "--version") { console.log(CURRENT_VERSION); return; }
  if (!args.length || args[0] === "--help") {
    console.log("Usage: ocv <validate|lint|migrate> <file> [--format json]\nMigration writes YAML to stdout and never overwrites the input.");
    return;
  }
  const [command, filename, ...options] = args;
  const json = options.length === 2 && options[0] === "--format" && options[1] === "json";
  if (!["validate", "lint", "migrate"].includes(command) || !filename || (options.length && !json)) {
    throw new Error("Usage: ocv <validate|lint|migrate> <file> [--format json]");
  }
  const file = await open(filename, "r");
  let source: string;
  try {
    const buffer = Buffer.alloc(MAX_INPUT_BYTES + 1);
    let bytesRead = 0;
    while (bytesRead < buffer.length) {
      const chunk = await file.read(buffer, bytesRead, buffer.length - bytesRead, bytesRead);
      if (!chunk.bytesRead) break;
      bytesRead += chunk.bytesRead;
    }
    if (bytesRead > MAX_INPUT_BYTES) throw new OcvError(`Input exceeds ${MAX_INPUT_BYTES} bytes.`);
    source = buffer.subarray(0, bytesRead).toString("utf8");
  } finally { await file.close(); }
  const document = parse(source);
  const checked = validate(document);
  if (command === "migrate") {
    const result = migrate(document);
    console.log(json ? JSON.stringify(result, null, 2) : stringify(result.document).trimEnd());
    return;
  }
  const result = { ...checked, warnings: command === "lint" ? lint(document) : [] };
  if (json) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(result.valid ? `Valid OCV ${String((document as { ocv: string }).ocv)}` : "Invalid OCV document");
    for (const issue of [...result.errors, ...result.warnings]) console.log(`${issue.path || "/"}: ${issue.message} [${issue.code}]`);
  }
  if (!result.valid) process.exitCode = 1;
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unable to run OCV CLI.";
  if (process.argv.includes("--format") && process.argv.includes("json")) {
    console.log(JSON.stringify({ valid: false, errors: error instanceof OcvError && error.issues.length ? error.issues : [{ code: "cli", path: "", message }] }));
  } else console.error(message);
  process.exitCode = error instanceof OcvError ? 1 : 2;
});
