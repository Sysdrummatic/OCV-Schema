import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_VERSION, lint, migrate, parse, stringify, validate } from "../src/index.js";

const minimal = () => ({ ocv: "1.0.0", person: { first_name: "Anna", family_name: "" } });

test("1.0.0 validates minimal CVs and all nested entries", () => {
  assert.equal(CURRENT_VERSION, "1.0.0");
  assert.equal(validate(minimal()).valid, true);
  for (const [section, entry] of Object.entries({
    summary: { position: "", description: "", default: "true" },
    contact: { label: "Email" },
    qr_codes: { label: "", value: "", size: 0 },
    skills: { name: "JS", level: 0 },
    languages: { name: "English", level_text: "C1", level: 6 },
    experience: { period: "2020", company: "Example", role: "Engineer", highlights: [5] },
    education: { period: "", school: "", degree: "" },
    courses: { year: -1, name: "Course" },
  })) {
    const result = validate({ ...minimal(), [section]: [entry] });
    assert.equal(result.valid, false, section);
    assert.ok(result.errors.some((error) => error.path.startsWith(`/${section}/0`)), section);
  }
});

test("names, unknown fields, versions, duplicate defaults and extensions are enforced", () => {
  assert.equal(validate({ ...minimal(), person: { first_name: "  ", family_name: "" } }).valid, false);
  assert.equal(validate({ ...minimal(), locale: "en" }).valid, false);
  assert.equal(validate({ ...minimal(), ocv: "9.0.0" }).errors[0].code, "unsupported-version");
  assert.equal(validate({ ...minimal(), entry_id: "private" }).valid, false);
  assert.equal(validate({ ...minimal(), person: { ...minimal().person, __ocv: {} } }).valid, false);
  assert.equal(validate({ ...minimal(), "x-example": { entries: [1, true, null] } }).valid, true);
  assert.equal(validate({ ...minimal(), "x-example": new Date() }).valid, false);
  const summary = { position: "Engineer", description: "", default: true };
  assert.equal(validate({ ...minimal(), summary: [summary, summary] }).valid, false);
});

test("validation and identity migration do not mutate or share input data", () => {
  const input = { ...minimal(), "x-example": { items: ["preserved"] } };
  const before = structuredClone(input);
  validate(input);
  const result = migrate(input);
  assert.equal(result.fromVersion, "1.0.0");
  assert.equal(result.toVersion, "1.0.0");
  assert.equal(result.changed, false);
  assert.deepEqual(result.document, before);
  assert.notEqual(result.document, input);
  assert.notEqual(result.document["x-example"], input["x-example"]);
  assert.deepEqual(input, before);
  assert.throws(() => migrate({ ...input, ocv: "9.0.0" }), /version/i);
});

test("YAML and JSON round-trip with ocv as the first serialized key", () => {
  const input = minimal();
  assert.deepEqual(parse(JSON.stringify(input)), input);
  assert.deepEqual(parse(stringify(input)), input);
  assert.match(stringify(input), /^ocv:/);
  assert.equal(validate(parse(stringify(input))).valid, true);
});

test("unsafe or ambiguous YAML constructs and oversized input are rejected", () => {
  for (const source of ["a: 1\na: 2", "a: &ref 1\nb: *ref", "a: !custom value", "a: 1\n---\nb: 2"]) {
    assert.throws(() => parse(source), undefined, source);
  }
  assert.throws(() => parse("x".repeat(100_001)), /100000/);
  assert.equal((parse('value: "&not-an-alias"') as { value: string }).value, "&not-an-alias");
  const cyclic: Record<string, unknown> = { ...minimal() };
  cyclic["x-cycle"] = cyclic;
  assert.equal(validate(cyclic).valid, false);
});

test("lint warnings do not change conformance or data", () => {
  const input = { ...minimal(), contact: [{ label: "Website", value: "Example", link: "javascript:alert(1)" }], experience: [{ period: "Yesterday", company: "Example", role: "Engineer", highlights: [] }] };
  const before = structuredClone(input);
  assert.equal(validate(input).valid, true);
  assert.ok(lint(input).some((issue) => issue.code === "unsafe-link"));
  assert.ok(lint(input).some((issue) => issue.code === "unstructured-period"));
  assert.deepEqual(input, before);
});
