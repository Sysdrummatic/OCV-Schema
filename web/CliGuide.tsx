import { CURRENT_VERSION } from "../src/index.js";

const commands = [
  {
    name: "validate",
    syntax: "ocv validate <file> [--format json]",
    description: "Check every section against the schema selected by the document's ocv version. Validation does not modify data or convert strings into numbers or booleans. Unknown versions fail explicitly.",
    example: "ocv validate cv.yaml\nocv validate cv.json --format json",
  },
  {
    name: "lint",
    syntax: "ocv lint <file> [--format json]",
    description: "Validate the document and report nonblocking warnings: unsafe or malformed contact links, periods that may need manual date mapping, and summaries without a default. Warnings alone do not fail the command. Invalid documents still fail validation.",
    example: "ocv lint cv.yaml\nocv lint cv.yaml --format json",
  },
  {
    name: "migrate",
    syntax: "ocv migrate <file> [--format json]",
    description: "Validate the source and write a new document in the library's default format to standard output. Migration preserves extensions, validates each step and never overwrites the input file. JSON output includes the document and migration report.",
    example: "ocv migrate cv.yaml > upgraded.yaml\nocv migrate cv.yaml --format json",
  },
  {
    name: "--help",
    syntax: "ocv --help",
    description: "Show usage and the migration output behavior. Running ocv without arguments also shows help. Use this option on its own.",
    example: "ocv --help",
  },
  {
    name: "--version",
    syntax: "ocv --version",
    description: "Show the library's current default OCV format version. This identifies the migration target, which may differ from the npm package version. Use this option on its own.",
    example: "ocv --version",
  },
];

export default function CliGuide() {
  return <section className="reference-page" aria-labelledby="cli-title">
    <header className="reference-intro"><p className="reference-eyebrow">Command reference</p><h1 id="cli-title">CLI</h1><p>Validate, review and migrate CV documents from your terminal or CI pipeline. Processing runs locally after dependencies are installed.</p></header>
    <section className="reference-card" aria-labelledby="cli-start"><h2 id="cli-start">Get started</h2><p>Requires Node.js 22 or later. The package is currently a local candidate and has not been published to npm. From the OCV-Schema repository:</p><pre><code>{"npm install\nnpm run build:package\nnode dist/src/cli.js --help"}</code></pre><p>The examples below use the installed <code>ocv</code> binary. In this repository, replace <code>ocv</code> with <code>node dist/src/cli.js</code>.</p><p>To use it in another project, run <code>npm pack</code> here, then install the resulting archive there:</p><pre><code>{"npm install /path/to/ocvschema-1.0.0.tgz\nnpm exec -- ocv validate cv.yaml"}</code></pre></section>
    <div className="cli-commands">{commands.map((command) => <section className="reference-card" key={command.name} aria-labelledby={`cli-${command.name}`}><h2 id={`cli-${command.name}`}><code>{command.name}</code></h2><p className="cli-syntax"><code>{command.syntax}</code></p><p>{command.description}</p><pre><code>{command.example}</code></pre>{command.name === "migrate" && <p>Current target: <strong>{CURRENT_VERSION}</strong>. With only 1.0.0 available, migration writes a validated copy without changing the version. Future format releases supply migration steps. Save to a different file: redirecting output to the input path would truncate it before the CLI reads it.</p>}{command.name === "--version" && <p>Current output: <code>{CURRENT_VERSION}</code>.</p>}</section>)}</div>
    <section className="reference-card" aria-labelledby="cli-json"><h2 id="cli-json">Machine-readable output</h2><p>Add <code>--format json</code> after the input file for validation, lint or migration. Without it, validation and lint use readable text, and migration writes YAML.</p><pre><code>ocv validate cv.yaml --format json</code></pre><p>Example output for a valid document:</p><pre><code>{"{\n  \"valid\": true,\n  \"errors\": [],\n  \"warnings\": []\n}"}</code></pre><p>Each diagnostic includes <code>code</code>, a JSON Pointer <code>path</code> and a <code>message</code>. Migration JSON contains <code>document</code>, <code>fromVersion</code>, <code>toVersion</code>, <code>changed</code> and <code>warnings</code>.</p></section>
    <section className="reference-card" aria-labelledby="cli-exit"><h2 id="cli-exit">Exit codes for CI</h2><dl className="cli-exit-codes"><dt><code>0</code></dt><dd>Success. Lint warnings alone also return 0.</dd><dt><code>1</code></dt><dd>Invalid input, unsupported version or migration failure.</dd><dt><code>2</code></dt><dd>Usage or I/O failure, such as an unknown command or unreadable file.</dd></dl><p>A CI step can run <code>npm exec -- ocv validate cv.yaml</code> and fail on a nonzero exit code.</p></section>
    <section className="reference-card" aria-labelledby="cli-input"><h2 id="cli-input">Input and current scope</h2><p>Pass one UTF-8 YAML or JSON file, up to 100,000 bytes. YAML must contain one document, with unique keys and no anchors, aliases or custom tags. Nesting beyond 64 levels is rejected during validation.</p><p>The current CLI supports the commands and options above. It does not provide stdin input, batch processing, target-version selection, template rendering or PDF/HTML export.</p></section>
  </section>;
}
