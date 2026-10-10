import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { inspect, safeHref, updateSource } from "../web/model.js";

test("form edits preserve extensions and source models", () => {
  const original = inspect(readFileSync("examples/full.yaml", "utf8"));
  const before = structuredClone(original.draft);
  const edited = inspect(updateSource(original.draft!, ["person", "first_name"], "Ada"));
  assert.equal(edited.cv?.person.first_name, "Ada");
  assert.deepEqual(edited.draft?.["x-example"], original.draft?.["x-example"]);
  assert.deepEqual(original.draft, before);
});

test("bad YAML is not available to overwrite through a form", () => {
  const checked = inspect("person: [");
  assert.equal(checked.draft, null);
  assert.equal(checked.cv, null);
  assert.ok(checked.errors.length);
});

test("preview links cannot activate code or relative destinations", () => {
  assert.equal(safeHref("https://example.com"), "https://example.com");
  assert.equal(safeHref("mailto:anna@example.com"), "mailto:anna@example.com");
  for (const input of ["javascript:alert(1)", "data:text/html,hello", "/relative", "not a url"]) assert.equal(safeHref(input), undefined);
});
