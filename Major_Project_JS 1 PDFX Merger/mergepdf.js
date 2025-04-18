const PDFMerger = require('pdf-merger-js');
const fs = require('fs');
const path = require('path');

const merger = new PDFMerger();

const mergePdfs = async (p1, p2) => {
  try {
    await merger.add(p1);  // Merge the first PDF
    await merger.add(p2);  // Merge the second PDF

    // Ensure 'public' directory exists
    const publicDir = path.join(__dirname, 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }

    let filename = `merged-${Date.now()}.pdf`;  // Generate unique filename
    const outputPath = path.join(publicDir, filename);  // Output path

    console.log('Saving merged PDF to:', outputPath);  // Log for debugging
    await merger.save(outputPath);  // Save the merged file

    return filename;  // Return file name for frontend
  } catch (err) {
    console.error('Merge Error:', err);
    throw err;
  }
};

module.exports = { mergePdfs };
