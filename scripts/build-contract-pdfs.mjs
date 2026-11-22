import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const dir = path.resolve("docs/commercial/package");
const docs = [
  { file: "00-document-index.html", label: "Document Index" },
  { file: "01-order-form.html", label: "Order Form" },
  { file: "02-invoice.html", label: "Tax Invoice" },
  { file: "03-receipt.html", label: "Receipt" },
  { file: "04-msa.html", label: "MSA v2.1" },
  { file: "05-dpa.html", label: "DPA" },
  { file: "06-sla.html", label: "SLA" },
  { file: "07-security-schedule.html", label: "Security Schedule" },
  { file: "08-acceptable-use-policy.html", label: "Acceptable Use Policy" },
];

function footer(label) {
  return (
    '<div style="width:100%;font-family:Arial,Helvetica,sans-serif;font-size:7.5px;color:#64748B;letter-spacing:0.04em;display:flex;justify-content:space-between;align-items:center;">' +
    `<span>Anchor Contract Package &middot; ANC-PKG-2026-0104 &middot; ${label} &middot; Illustrative specimen</span>` +
    '<span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>' +
    "</div>"
  );
}

const browser = await chromium.launch();
const page = await browser.newPage();

const hashes = [];

for (const doc of docs) {
  const src = path.join(dir, doc.file);
  const out = src.replace(/\.html$/, ".pdf");
  await page.goto(pathToFileURL(src).href, { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: out,
    format: "A4",
    printBackground: true,
    margin: { top: "16mm", bottom: "18mm", left: "16mm", right: "16mm" },
    displayHeaderFooter: true,
    headerTemplate: "<span></span>",
    footerTemplate: footer(doc.label),
  });
  const bytes = fs.readFileSync(out);
  const hash = crypto.createHash("sha256").update(bytes).digest("hex");
  hashes.push({ file: path.basename(out), label: doc.label, sha256: hash, bytes: bytes.length });
  console.log(`PDF: ${path.basename(out)}  ${hash.slice(0, 16)}…`);
}

// Detached integrity certificate
const rows = hashes
  .map(
    (h) => `
      <tr>
        <td style="font-family:Arial,sans-serif;font-size:9px;font-weight:600;padding:7px 6px;border-bottom:1px solid #eef2f6;vertical-align:top">${h.label}</td>
        <td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:8px;padding:7px 6px;border-bottom:1px solid #eef2f6;word-break:break-all">${h.file}</td>
        <td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:7.5px;padding:7px 6px;border-bottom:1px solid #eef2f6;word-break:break-all">${h.sha256}</td>
      </tr>`
  )
  .join("");

const issued = new Date().toISOString();
const certHtml = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8" /><title>Anchor Integrity Certificate</title>
<link rel="stylesheet" href="legal.css" /></head>
<body><section class="page">
  <div class="doc-head">
    <div class="brand"><div class="mark">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2.4"/><path d="M12 7.4V21"/><path d="M5 12H19"/><path d="M5 12c0 4 3 6.5 7 6.5s7-2.5 7-6.5"/></svg>
    </div><div><div class="brand-name">ANIMUSLAB TECHNOLOGIES</div><div class="brand-sub">Detached Integrity Certificate</div></div></div>
    <div class="doc-id"><div class="kind">Integrity Certificate</div><div class="ref">ANC-CERT-2026-0104</div><div class="ver">Generated ${issued}</div></div>
  </div>
  <div class="doc-title"><h1>Document Integrity Certificate</h1>
    <div class="sub">This detached certificate records the SHA-256 digest of each PDF in the package. It is not embedded in the documents, because a document cannot contain a verifiable hash of itself.</div>
    <div class="status-strip"><span class="tag warn">Illustrative specimen</span><span class="tag">Detached record</span></div>
  </div>
  <div class="note info" style="margin-top:16px">
    Verify a copy by recomputing SHA-256 over the exact file bytes and comparing the result with the row below.
    A mismatch means the file has changed since issuance. Retain this certificate with the executed set and the
    e-signature audit record.
  </div>
  <div class="sec">
    <div class="sec-head"><span class="no">A</span><h2>Hashes of issued PDFs</h2><span class="note">SHA-256</span></div>
    <table><thead><tr><th style="width:130px">Document</th><th style="width:180px">File</th><th>SHA-256</th></tr></thead><tbody>${rows}</tbody></table>
  </div>
  <div class="sec">
    <div class="sec-head"><span class="no">B</span><h2>Scope and caveat</h2><span class="note">What this proves</span></div>
    <p>This certificate proves only that the listed files had the listed bytes at the recorded time. It does not prove authority, execution or payment. For a real deal, bind these hashes into the e-signature envelope and store the certificate in the contract system.</p>
    <p style="font-size:9.5px;color:#64748b">Generated by AnimusLab's document build process. This is an illustrative artefact, not legal advice.</p>
  </div>
  <div class="foot"><span>Anchor Integrity Certificate · ANC-CERT-2026-0104 · Illustrative specimen</span><span class="pno">Certificate</span></div>
</section></body></html>`;

const certPath = path.join(dir, "09-integrity-certificate.html");
fs.writeFileSync(certPath, certHtml, "utf8");
fs.writeFileSync(
  path.join(dir, "integrity-certificate.json"),
  JSON.stringify({ package: "ANC-PKG-2026-0104", generatedAt: issued, documents: hashes }, null, 2),
  "utf8"
);

await page.goto(pathToFileURL(certPath).href, { waitUntil: "networkidle" });
await page.emulateMedia({ media: "print" });
await page.pdf({
  path: path.join(dir, "09-integrity-certificate.pdf"),
  format: "A4",
  printBackground: true,
  margin: { top: "16mm", bottom: "18mm", left: "16mm", right: "16mm" },
  displayHeaderFooter: true,
  headerTemplate: "<span></span>",
  footerTemplate: footer("Integrity Certificate"),
});
console.log("PDF: 09-integrity-certificate.pdf");

await browser.close();
