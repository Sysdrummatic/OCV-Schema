import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, unlinkSync, rmdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { parse, validate } from "../src/index.js";

function run(...args: string[]) {
  return spawnSync(process.execPath, ["--import", "tsx", "src/cli.ts", ...args], { encoding: "utf8" });
}

test("CLI validates a real file and returns machine-readable diagnostics", () => {
  const result = run("validate", "examples/full.yaml", "--format", "json");
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).valid, true);
  const invalid = run("validate", "tests/fixtures/invalid.yaml", "--format", "json");
  assert.equal(invalid.status, 1);
  assert.equal(JSON.parse(invalid.stdout).valid, false);
  assert.equal(run("validate", "missing-file.yaml").status, 2);
  assert.equal(run("unknown", "examples/full.yaml").status, 2);
});

test("CLI migration writes valid YAML without overwriting the source", () => {
  const before = readFileSync("examples/full.yaml", "utf8");
  const result = run("migrate", "examples/full.yaml");
  assert.equal(result.status, 0, result.stderr);
  assert.equal(validate(parse(result.stdout)).valid, true);
  assert.equal(readFileSync("examples/full.yaml", "utf8"), before);
});

test("CLI reads the full input and enforces the byte limit", () => {
  const directory = mkdtempSync(join(tmpdir(), "ocv-cli-"));
  const filename = join(directory, "cv.yaml");
  const prefix = readFileSync("examples/minimal.yaml", "utf8") + "\n#";
  try {
    writeFileSync(filename, prefix + " ".repeat(100_000 - Buffer.byteLength(prefix)));
    assert.equal(run("validate", filename).status, 0);
    writeFileSync(filename, prefix + " ".repeat(100_001 - Buffer.byteLength(prefix)));
    const result = run("validate", filename, "--format", "json");
    assert.equal(result.status, 1);
    assert.match(JSON.parse(result.stdout).errors[0].message, /100000/);
  } finally {
    unlinkSync(filename);
    rmdirSync(directory);
  }
});
