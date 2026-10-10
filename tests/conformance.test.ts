import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { parse, validate } from "../src/index.js";

type Case = { name: string; valid: boolean; document: unknown };
const cases = JSON.parse(readFileSync("tests/fixtures/conformance.json", "utf8")) as Case[];
for (const fixture of cases) {
  test(`conformance: ${fixture.name}`, () => assert.equal(validate(fixture.document).valid, fixture.valid));
}
test("all published YAML examples conform", () => {
  for (const file of ["examples/full.yaml", "examples/minimal.yaml"]) assert.equal(validate(parse(readFileSync(file, "utf8"))).valid, true, file);
});
