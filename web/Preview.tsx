import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { OcvDocument, QrCode } from "../src/index.js";
import { safeHref } from "./model";

function Qr({ entry }: { entry: QrCode }) {
  const [image, setImage] = useState("");
  useEffect(() => {
    let active = true;
    if (!entry.value.trim()) return;
    QRCode.toDataURL(entry.value, { width: entry.size, margin: 2 })
      .then((url) => { if (active) setImage(url); })
      .catch(() => { if (active) setImage(""); });
    return () => { active = false; };
  }, [entry.value, entry.size]);
  return <figure className="qr">{image && <img src={image} alt={entry.label || "QR"} width={entry.size} height={entry.size} />}<figcaption>{entry.label}</figcaption></figure>;
}

export default function Preview({ cv }: { cv: OcvDocument }) {
  const summary = cv.summary?.find((entry) => entry.default);
  const labels = { skills: "Skills", tech_stack: "Technologies", languages: "Languages", interests: "Interests", experience: "Experience", education: "Education", courses: "Courses" };
  const side = <>
    {!!cv.contact?.length && <address>{cv.contact.map((entry, i) => <div key={i}><span>{entry.label}</span>{safeHref(entry.link) ? <a href={safeHref(entry.link)} rel="noreferrer" target="_blank">{entry.value}</a> : <p>{entry.value}</p>}</div>)}</address>}
    {!!cv.skills?.length && <section><h3>{labels.skills}</h3>{cv.skills.map((entry, i) => <p key={i}>{entry.name} <span className="rating">{entry.level}/5</span></p>)}</section>}
    {!!cv.tech_stack?.length && <section><h3>{labels.tech_stack}</h3><p>{cv.tech_stack.join(", ")}</p></section>}
    {!!cv.languages?.length && <section><h3>{labels.languages}</h3>{cv.languages.map((entry, i) => <p key={i}>{entry.name} <span className="rating">{entry.level_text || `${entry.level}/5`}</span></p>)}</section>}
    {!!cv.interests?.length && <section><h3>{labels.interests}</h3><p>{cv.interests.join(", ")}</p></section>}
    {cv.qr_codes?.map((entry, i) => <Qr key={`${i}-${entry.value}`} entry={entry} />)}
  </>;
  return <article className="paper basic" lang="">
    <header className="cv-header"><div className="initials">{cv.person.brand_initials || [cv.person.first_name, cv.person.family_name].map((name) => name.charAt(0)).join("")}</div><div><h2>{cv.person.first_name} {cv.person.family_name}</h2>{summary?.position && <p>{summary.position}</p>}</div></header>
    <div className="cv-layout"><aside>{side}</aside><div className="cv-main">
      {summary?.description && <p className="summary-text">{summary.description}</p>}
      {!!cv.experience?.length && <section><h3>{labels.experience}</h3>{cv.experience.map((entry, i) => <div className="cv-entry" key={i}><h4>{entry.role}</h4><p className="entry-meta">{entry.company} <span>{entry.period}</span></p><ul>{entry.highlights.map((line, j) => <li key={j}>{line}</li>)}</ul></div>)}</section>}
      {!!cv.education?.length && <section><h3>{labels.education}</h3>{cv.education.map((entry, i) => <div className="cv-entry" key={i}><h4>{entry.degree}</h4><p className="entry-meta">{entry.school} <span>{entry.period}</span></p><p>{entry.detail}</p></div>)}</section>}
      {!!cv.courses?.length && <section><h3>{labels.courses}</h3>{cv.courses.map((entry, i) => <p key={i}>{entry.name}{entry.year > 0 && <span className="rating"> {entry.year}</span>}</p>)}</section>}
    </div></div>
    {cv.gdpr_clause && <footer className="cv-footer">{cv.gdpr_clause}</footer>}
  </article>;
}
