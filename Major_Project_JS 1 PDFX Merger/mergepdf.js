const PDFMerger = require('pdf-merger-js');
const fs = require('fs');
const path = require('path');

const merger = new PDFMerger();

const mergePdfs = async (p1, p2) => {
  await merger.add(p1);  // Merge the first PDF
  await merger.add(p2);  // Merge the second PDF
  
  let filename = `merged-${Date.now()}.pdf`;  // Generate a unique filename based on the current timestamp
  const outputPath = path.join(__dirname, 'public', filename);  // Set the correct output path
  
  await merger.save(outputPath);  // Save the merged PDF in the 'public' directory
  
  return filename;  // Return the filename
};

module.exports = { mergePdfs };
