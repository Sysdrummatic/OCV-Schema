import { cp, mkdir } from "node:fs/promises";

await mkdir("site/docs", { recursive: true });
await cp("schemas", "site/schemas", { recursive: true });
await cp("examples", "site/examples", { recursive: true });
await cp("docs/specification.md", "site/docs/specification.md");
