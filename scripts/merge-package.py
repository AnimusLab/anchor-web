import fitz, os
src = r"docs/commercial/package"
order = [
 "00-document-index.pdf","01-order-form.pdf","02-invoice.pdf","03-receipt.pdf",
 "04-msa.pdf","05-dpa.pdf","06-sla.pdf","07-security-schedule.pdf",
 "08-acceptable-use-policy.pdf","09-integrity-certificate.pdf"
]
out = fitz.open()
for f in order:
    d = fitz.open(os.path.join(src, f))
    out.insert_pdf(d)
    d.close()
dest = os.path.join(src, "Anchor-Contract-Package-ANC-PKG-2026-0104.pdf")
out.save(dest, garbage=4, deflate=True)
print("merged", out.page_count, "pages ->", dest)
out.close()
