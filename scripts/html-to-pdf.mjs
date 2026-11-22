import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import path from "node:path";

const jobs = [
  {
    src: "docs/commercial/checkout-receipt.html",
    out: "docs/commercial/Anchor-Checkout-Receipt-ANC-RCT-2027-0104.pdf",
    margin: { top: "12mm", bottom: "12mm", left: "12mm", right: "12mm" },
    runningFooter: null,
  },
  {
    src: "docs/commercial/order-form-contract.html",
    out: "docs/commercial/Anchor-Order-Form-ANC-OF-2027-0104.pdf",
    margin: { top: "16mm", bottom: "18mm", left: "16mm", right: "16mm" },
    runningFooter:
      '<div style="width:100%;font-family:Arial,Helvetica,sans-serif;font-size:7.5px;color:#64748B;letter-spacing:0.04em;display:flex;justify-content:space-between;align-items:center;">' +
      "<span>Anchor Commercial Order Form &middot; ANC-OF-2027-0104 &middot; Confidential</span>" +
      '<span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>' +
      "</div>",
  },
];

const browser = await chromium.launch();

for (const job of jobs) {
  const page = await browser.newPage();
  const srcPath = path.resolve(process.cwd(), job.src);
  const outPath = path.resolve(process.cwd(), job.out);

  await page.goto(pathToFileURL(srcPath).href, { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print" });

  const options = {
    path: outPath,
    format: "A4",
    printBackground: true,
    margin: job.margin,
  };

  if (job.runningFooter) {
    options.displayHeaderFooter = true;
    options.headerTemplate = "<span></span>";
    options.footerTemplate = job.runningFooter;
  }

  await page.pdf(options);
  console.log(`PDF written: ${job.out}`);
  await page.close();
}

await browser.close();
