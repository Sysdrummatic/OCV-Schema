import { readFile, writeFile } from "node:fs/promises";
import { compile } from "json-schema-to-typescript";

const schema = JSON.parse(await readFile(new URL("../schemas/1.0.0/schema.json", import.meta.url), "utf8"));
const output = await compile(schema, "OcvDocument", {
  bannerComment: "/* Generated from schemas/1.0.0/schema.json. Run npm run generate:types. */",
});
const destination = new URL("../src/types.generated.ts", import.meta.url);
if (process.argv.includes("--check")) {
  if (await readFile(destination, "utf8") !== output) {
    throw new Error("Generated types are stale. Run npm run generate:types.");
  }
} else {
  await writeFile(destination, output);
}
