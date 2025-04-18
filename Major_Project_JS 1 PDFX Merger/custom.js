const fs = require('fs');
const PDFDocument = require('pdf-lib').PDFDocument;
const path = require('path');

async function CustomMerger(pdf1Path, pdf2Path, Pdf1Start, Pdf1End, Pdf2Start, Pdf2End) {
  const pdfDoc = await PDFDocument.create();
const outputPath = path.join(__dirname, 'uploads', `${filename}.pdf`);
  // Load the first PDF
  const pdf1Bytes = fs.readFileSync(pdf1Path);
  const pdf1 = await PDFDocument.load(pdf1Bytes);
  
  // Extract specified pages from the first PDF
  const pdf1Pages = await pdfDoc.copyPages(pdf1, Array.from({ length: Pdf1End - Pdf1Start + 1 }, (_, i) => i + Pdf1Start - 1));
  pdf1Pages.forEach(page => pdfDoc.addPage(page));

  // Load the second PDF
  const pdf2Bytes = fs.readFileSync(pdf2Path);
  const pdf2 = await PDFDocument.load(pdf2Bytes);

  // Extract specified pages from the second PDF
  const pdf2Pages = await pdfDoc.copyPages(pdf2, Array.from({ length: Pdf2End - Pdf2Start + 1 }, (_, i) => i + Pdf2Start - 1));
  pdf2Pages.forEach(page => pdfDoc.addPage(page));

  // Save the merged PDF to a new file
  const mergedPdfBytes = await pdfDoc.save();
  const mergedPdfPath = `merged-${Date.now()}.pdf`;
  fs.writeFileSync(path.join(__dirname, 'public', mergedPdfPath), mergedPdfBytes);
  
  return mergedPdfPath;
  return `${filename}`;  // Not full path
}

module.exports = { CustomMerger };
