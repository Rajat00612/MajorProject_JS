const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdf-lib').PDFDocument;

async function CustomMerger(pdf1Path, pdf2Path, Pdf1Start, Pdf1End, Pdf2Start, Pdf2End) {
  try {
    const pdfDoc = await PDFDocument.create();

    // Load the first PDF
    console.log('Reading PDF 1 from:', pdf1Path);
    const pdf1Bytes = fs.readFileSync(pdf1Path);
    const pdf1 = await PDFDocument.load(pdf1Bytes);
    const pdf1Pages = await pdfDoc.copyPages(
      pdf1,
      Array.from({ length: Pdf1End - Pdf1Start + 1 }, (_, i) => i + Pdf1Start - 1)
    );
    pdf1Pages.forEach(page => pdfDoc.addPage(page));

    // Load the second PDF
    console.log('Reading PDF 2 from:', pdf2Path);
    const pdf2Bytes = fs.readFileSync(pdf2Path);
    const pdf2 = await PDFDocument.load(pdf2Bytes);
    const pdf2Pages = await pdfDoc.copyPages(
      pdf2,
      Array.from({ length: Pdf2End - Pdf2Start + 1 }, (_, i) => i + Pdf2Start - 1)
    );
    pdf2Pages.forEach(page => pdfDoc.addPage(page));

    // Ensure 'public' directory exists
    const publicDir = path.join(__dirname, 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }

    // Save the merged file
    const mergedPdfBytes = await pdfDoc.save();
    const filename = `merged-${Date.now()}.pdf`;
    const outputPath = path.join(publicDir, filename);

    console.log('Saving custom merged PDF to:', outputPath);
    fs.writeFileSync(outputPath, mergedPdfBytes);

    return filename;
  } catch (err) {
    console.error('Custom Merge Error:', err);
    throw err;
  }
}

module.exports = { CustomMerger };
