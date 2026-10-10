import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import sample from "../examples/full.yaml?raw";
import { CURRENT_VERSION, MAX_INPUT_BYTES, lint, schemaV1, type OcvDocument } from "../src/index.js";
import Preview from "./Preview";
import CliGuide from "./CliGuide";
import Specification from "./Specification";
import { inspect, isRecord, updateSource, type Draft } from "./model";

type FieldSchema = { type?: string; minimum?: number; maximum?: number; properties?: Record<string, FieldSchema> };
const definitions = schemaV1.$defs as Record<string, FieldSchema>;
const sections = {
  summary: "Summary", contact: "Contact", qr_codes: "QrCode", skills: "Skill", languages: "Language",
  experience: "Experience", education: "Education", courses: "Course",
} as const;
const fieldLabels: Record<string, string> = { brand_initials: "Initials", level: "Self-assessment (1–5)", size: "QR size (px)", level_text: "Level description", highlights: "Highlights (one per line)", gdpr_clause: "Recruitment clause" };

function pageFromHash(): "editor" | "cli" | "specification" {
  const hash = window.location.hash;
  if (["#cli", "#ocv-cli", "#cli-content"].includes(hash)) return "cli";
  if (["#specification", "#specification-content"].includes(hash)) return "specification";
  return "editor";
}

function emptyEntry(name: string) {
  return Object.fromEntries(Object.entries(definitions[name].properties ?? {}).map(([key, field]) => [key,
    field.type === "boolean" ? false : field.type === "integer" ? key === "level" ? 3 : key === "size" ? 130 : 0 : field.type === "array" ? [] : "",
  ]));
}

function Field({ name, value, schema, label, onChange }: { name: string; value: unknown; schema: FieldSchema; label: string; onChange: (value: unknown) => void }) {
  if (schema.type === "boolean") return <label className="check-field"><input type="checkbox" checked={value === true} onChange={(event) => onChange(event.target.checked)} />{label}</label>;
  if (schema.type === "array") return <label>{label}<textarea rows={3} value={Array.isArray(value) ? value.join("\n") : ""} onChange={(event) => onChange(event.target.value ? event.target.value.split("\n") : [])} /></label>;
  if (schema.type === "integer") return <label>{label}<input type="number" step="1" min={schema.minimum} max={schema.maximum} value={typeof value === "number" ? value : ""} onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))} /></label>;
  if (["description", "detail", "gdpr_clause"].includes(name)) return <label className="wide-field">{label}<textarea rows={3} value={typeof value === "string" ? value : ""} onChange={(event) => onChange(event.target.value)} /></label>;
  return <label>{label}<input value={typeof value === "string" ? value : ""} onChange={(event) => onChange(event.target.value)} /></label>;
}

export default function App() {
  const [page, setPage] = useState(pageFromHash);
  const [source, setSource] = useState(sample);
  const [dark, setDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);
  const [mode, setMode] = useState<"form" | "yaml">("form");
  const [notice, setNotice] = useState("");
  const [lastValid, setLastValid] = useState<OcvDocument>(() => inspect(sample).cv!);
  const checked = useMemo(() => inspect(source), [source]);
  const cv = checked.cv ?? lastValid;
  const warnings = useMemo(() => checked.cv ? lint(checked.cv) : [], [checked.cv]);
  const editable = checked.draft?.ocv === CURRENT_VERSION && isRecord(checked.draft.person);
  const label = (field: string) => fieldLabels[field] ?? field.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    const navigate = () => setPage(pageFromHash());
    window.addEventListener("hashchange", navigate);
    return () => {
      window.removeEventListener("hashchange", navigate);
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  useLayoutEffect(() => { window.scrollTo(0, 0); }, [page]);

  function accept(next: string) {
    setSource(next);
    setNotice("");
    const updated = inspect(next).cv;
    if (updated) setLastValid(updated);
  }
  function change(path: readonly (string | number)[], value: unknown) {
    if (!checked.draft) return;
    try { accept(updateSource(checked.draft, path, value)); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Unable to update CV."); }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([source], { type: "application/yaml;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = "cv.ocv.yaml"; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function importFile(file: File | undefined) {
    if (!file) return;
    try {
      if (file.size > MAX_INPUT_BYTES) throw new Error("File exceeds 100,000 bytes.");
      accept(await file.text());
      setMode("yaml");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to read file."); }
  }

  return <div className="app" data-theme={dark ? "dark" : "light"} lang="en">
    <a className="skip-link" href={`#${page}-content`}>Skip to content</a>
    <header className="site-header"><a className="brand" href="#"><span className="brand-symbol" aria-hidden="true">OCV</span><span>Schema <small>1.0.0</small></span></a><nav aria-label="Navigation">
      <a href="#editor" onClick={() => window.scrollTo(0, 0)} aria-current={page === "editor" ? "page" : undefined}>Editor</a>
      <a href="#cli" onClick={() => window.scrollTo(0, 0)} aria-current={page === "cli" ? "page" : undefined}>CLI</a>
      <a href="#specification" onClick={() => window.scrollTo(0, 0)} aria-current={page === "specification" ? "page" : undefined}>Specification</a>
      <a href="https://github.com/Sysdrummatic/OCV-Schema">GitHub</a>
      <button onClick={() => setDark(!dark)}>{dark ? "Light theme" : "Dark theme"}</button>
    </nav></header>
    <main><div id="editor-content" hidden={page !== "editor"} tabIndex={-1}><section className="intro"><div><h1>Your CV. An open format.</h1><p>Fill in your details, check the document and preview the Basic style. Everything runs in your browser.</p></div><div className="install"><span>A library for your project</span><code>npm install ocvschema</code><small>Local implementation · npm package not published yet</small></div></section>
    <div className="workspace"><section className="editor" aria-label="CV editor">
      <div className="toolbar"><div className="tabs"><button aria-pressed={mode === "form"} onClick={() => setMode("form")}>Form</button><button aria-pressed={mode === "yaml"} onClick={() => setMode("yaml")}>YAML</button></div><label className="file-button">Open<input type="file" accept=".yaml,.yml,.json" onChange={(event) => { void importFile(event.target.files?.[0]); event.target.value = ""; }} /></label><button onClick={download} disabled={!checked.cv}>Download YAML</button></div>
      <div className="validation" role="status"><span className={checked.cv ? "valid" : "invalid"}>{checked.cv ? "Valid CV" : "Document needs attention"}</span><span>OCV {CURRENT_VERSION}</span></div>
      {notice && <p className="notice" role="alert">{notice}</p>}
      {!!checked.errors.length && <div className="diagnostics" role="alert"><ul>{checked.errors.map((error, i) => <li key={i}><code>{error.path || "/"}</code> {error.message}</li>)}</ul></div>}
      {!!warnings.length && <details className="diagnostics warnings"><summary>Warnings ({warnings.length})</summary><ul>{warnings.map((warning, i) => <li key={i}><code>{warning.path}</code> {warning.message}</li>)}</ul></details>}
      {mode === "yaml" ? <label className="source-field">YAML source<textarea className="source-editor" spellCheck={false} value={source} onChange={(event) => accept(event.target.value)} /></label> : !editable ? <div className="empty-state"><p>Correct the syntax, version and person object in YAML to use the form.</p><button onClick={() => setMode("yaml")}>Open YAML</button></div> : <div className="form-sections">
        <fieldset><legend>{label("person")}</legend><div className="field-grid">{Object.entries(definitions.Person.properties ?? {}).map(([key, field]) => <Field key={key} name={key} value={(checked.draft!.person as Draft)[key]} schema={field} label={label(key)} onChange={(value) => change(["person", key], value)} />)}</div></fieldset>
        {Object.entries(sections).map(([section, definition]) => {
          const items = checked.draft![section];
          if (items !== undefined && (!Array.isArray(items) || items.some((item) => !isRecord(item)))) return <fieldset key={section}><legend>{label(section)}</legend><p>Correct this section's structure in YAML.</p></fieldset>;
          return <fieldset key={section}><legend>{label(section)}</legend>{(Array.isArray(items) ? items : []).map((entry, index) => <div className="form-entry" key={index}><div className="entry-heading"><strong>{label(section)} {index + 1}</strong><button className="remove" aria-label={`Remove ${label(section)} ${index + 1}`} onClick={() => change([section], (items as unknown[]).filter((_, i) => i !== index))}>Remove</button></div><div className="field-grid">{Object.entries(definitions[definition].properties ?? {}).map(([key, field]) => <Field key={key} name={key} value={(entry as Draft)[key]} schema={field} label={label(key)} onChange={(value) => change([section, index, key], value)} />)}</div></div>)}<button className="add-entry" onClick={() => change([section], [...(Array.isArray(items) ? items : []), emptyEntry(definition)])}>+ Add entry</button></fieldset>;
        })}
        {(["tech_stack", "interests", "gdpr_clause"] as const).map((section) => <fieldset key={section}><legend>{label(section)}</legend><Field name={section} value={checked.draft![section]} schema={{ type: section === "gdpr_clause" ? "string" : "array" }} label={section === "gdpr_clause" ? label(section) : "One entry per line"} onChange={(value) => change([section], value)} /></fieldset>)}
      </div>}
    </section><section className="preview-pane" aria-label="CV preview"><div className="preview-toolbar"><h2>Preview</h2><label>Template<select defaultValue="basic"><option value="basic">Basic</option></select></label></div>{!checked.cv && <p className="stale" role="status">Last valid preview. Current changes need attention.</p>}<Preview cv={cv} /></section></div>
    <section className="about"><h2>A shared contract for CV tools</h2><p>A versioned schema, offline validation and migrations delivered with the library. No account or CV upload to a server.</p><div className="about-links"><a href={`${import.meta.env.BASE_URL}schemas/1.0.0/schema.json`}>JSON Schema 1.0.0</a><a href={`${import.meta.env.BASE_URL}examples/full.yaml`}>Example CV</a><a href="https://github.com/Sysdrummatic/OCV-Schema/blob/master/docs/integration.md">SDK / CLI</a></div></section>
    </div><div id="cli-content" hidden={page !== "cli"} tabIndex={-1}><CliGuide /></div><div id="specification-content" hidden={page !== "specification"} tabIndex={-1}><Specification /></div>
    </main><footer className="site-footer"><span>OCV Schema · Apache-2.0</span><p>Need CV publishing and full exports? <a href="https://opencivera.com">OpenCiVera</a></p></footer>
  </div>;
}
