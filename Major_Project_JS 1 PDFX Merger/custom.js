const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdf-lib').PDFDocument;

async function CustomMerger(pdf1Path, pdf2Path, Pdf1Start, Pdf1End, Pdf2Start, Pdf2End) {
  const pdfDoc = await PDFDocument.create();

  // Load the first PDF
  const pdf1Bytes = fs.readFileSync(pdf1Path);
  const pdf1 = await PDFDocument.load(pdf1Bytes);
  const pdf1Pages = await pdfDoc.copyPages(pdf1, Array.from({ length: Pdf1End - Pdf1Start + 1 }, (_, i) => i + Pdf1Start - 1));
  pdf1Pages.forEach(page => pdfDoc.addPage(page));

  // Load the second PDF
  const pdf2Bytes = fs.readFileSync(pdf2Path);
  const pdf2 = await PDFDocument.load(pdf2Bytes);
  const pdf2Pages = await pdfDoc.copyPages(pdf2, Array.from({ length: Pdf2End - Pdf2Start + 1 }, (_, i) => i + Pdf2Start - 1));
  pdf2Pages.forEach(page => pdfDoc.addPage(page));

  // Save the merged file
  const mergedPdfBytes = await pdfDoc.save();
  const filename = `merged-${Date.now()}.pdf`;
  const outputPath = path.join(__dirname, 'public', filename);
  fs.writeFileSync(outputPath, mergedPdfBytes);

  return filename;  // Return the filename after saving
}

module.exports = { CustomMerger };
