import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CHROME = process.env.CHROME_PATH || (process.platform === "darwin"
  ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  : "google-chrome");
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TMP_PDF = path.join(ROOT, ".tmp", "pdf");
const FINAL_DIR = path.join(ROOT, "public", "pdfs");

fs.mkdirSync(TMP_PDF, { recursive: true });
fs.mkdirSync(FINAL_DIR, { recursive: true });

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "public/print/index.json"), "utf8"));

function printHtmlToPdf(htmlPath, outPdfPath) {
  const fileUrl = `file://${htmlPath}`;
  execFileSync(CHROME, [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    `--print-to-pdf=${outPdfPath}`,
    fileUrl
  ], { stdio: "ignore" });
}

function mergePdfs(pdfList, outputPath) {
  const script = `
ObjC.import("PDFKit");
ObjC.import("Foundation");

function merge(sources, output) {
  var outDoc = $.PDFDocument.alloc.init;
  var pageIndex = 0;
  for (var i = 0; i < sources.length; i++) {
    var inDoc = $.PDFDocument.alloc.initWithURL($.NSURL.fileURLWithPath(sources[i]));
    if (!inDoc) continue;
    var count = inDoc.pageCount;
    for (var p = 0; p < count; p++) {
      var page = inDoc.pageAtIndex(p);
      outDoc.insertPageAtIndex(page, pageIndex++);
    }
  }
  return outDoc.writeToFile(output);
}

var sources = ${JSON.stringify(pdfList)};
var output = ${JSON.stringify(outputPath)};
merge(sources, output);
`;
  execFileSync("osascript", ["-l", "JavaScript", "-e", script], { stdio: "ignore" });
}

for (const mod of manifest) {
  console.log(`Generating PDF for ${mod.code} - ${mod.title}...`);
  const coverHtml = path.join(ROOT, mod.cover);
  const bodyHtml = path.join(ROOT, mod.body);
  const coverPdf = path.join(TMP_PDF, `${mod.code}-cover.pdf`);
  const bodyPdf = path.join(TMP_PDF, `${mod.code}-body.pdf`);
  const finalPdf = path.join(ROOT, mod.pdf);

  printHtmlToPdf(coverHtml, coverPdf);
  printHtmlToPdf(bodyHtml, bodyPdf);

  mergePdfs([coverPdf, bodyPdf], finalPdf);

  if (fs.existsSync(finalPdf)) {
    const size = (fs.statSync(finalPdf).size / 1024 / 1024).toFixed(2);
    console.log(`  ✓ Created ${path.basename(finalPdf)} (${size} MB)`);
  } else {
    console.error(`  ✗ Failed to create ${finalPdf}`);
  }
}

console.log("All PDFs generated successfully in public/pdfs!");
