const PDFMerger = require('pdf-merger-js');
const fs = require('fs');
const path = require('path');

const mergePdfs = async (p1, p2) => {
  const merger = new PDFMerger();

  await merger.add(p1);
  await merger.add(p2);

  let filename = `merged-${Date.now()}.pdf`;
  const outputPath = path.join(__dirname, 'public', filename);

  await merger.save(outputPath);

  return filename;
};

module.exports = { mergePdfs };

