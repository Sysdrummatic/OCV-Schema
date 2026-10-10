import assert from "node:assert/strict";
import { test } from "node:test";
import { createStandard, type Release } from "../src/standard.js";

// Synthetic releases exercise the pipeline; only 1.0.0 is shipped publicly.
function release(version: string): Release {
  return { version, schema: {
    $id: `https://example.com/test/${version}`,
    type: "object", required: ["ocv", "value"],
    properties: { ocv: { const: version }, value: { type: "string" } },
  } };
}

test("a dependency upgrade changes the target while retaining old validation", () => {
  const oldest = release("1.0.0");
  oldest.migrateToNext = (document) => ({ document: { ...document, ocv: "1.1.0" }, warnings: [] });
  const middle = release("1.1.0");
  middle.migrateToNext = (document) => ({ document: { ...document, ocv: "2.0.0", value: String(document.value).toUpperCase() }, warnings: [{ code: "test-change", path: "/value", message: "Synthetic transformation." }] });
  const standard = createStandard([oldest, middle, release("2.0.0")]);
  const input = { ocv: "1.0.0", value: "anna", "x-example": { original: true } };
  assert.equal(standard.validate(input).valid, true);
  const result = standard.migrate(input);
  assert.equal(result.changed, true);
  assert.equal(result.toVersion, "2.0.0");
  assert.equal(result.document.value, "ANNA");
  assert.deepEqual(result.document["x-example"], input["x-example"]);
  assert.equal(input.value, "anna");
  assert.equal(input.ocv, "1.0.0");
  assert.equal(result.warnings.length, 1);
});

test("missing and invalid migrations fail instead of returning partial data", () => {
  const input = { ocv: "1.0.0", value: "anna" };
  assert.throws(() => createStandard([release("1.0.0"), release("1.1.0")]).migrate(input), /Missing migration/);
  const old = release("1.0.0");
  old.migrateToNext = (document) => ({ document: { ...document, ocv: "1.1.0", value: 7 }, warnings: [] });
  assert.throws(() => createStandard([old, release("1.1.0")]).migrate(input), /invalid document/);
  assert.deepEqual(input, { ocv: "1.0.0", value: "anna" });
});
