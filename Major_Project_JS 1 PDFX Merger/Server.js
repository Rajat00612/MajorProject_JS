const express = require('express');
const path = require('path');
const multer = require('multer');
const { mergePdfs } = require('./mergepdf');
const { CustomMerger } = require('./custom');
const session = require('express-session');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// ✅ Ensure required folders exist
const uploadsDir = path.join(__dirname, 'uploads');
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// ✅ Multer setup
const upload = multer({ dest: uploadsDir });

// ✅ Middleware
app.use('/static', express.static(publicDir));     // Serve merged PDFs
app.use('/static', express.static(uploadsDir));    // Serve uploaded files
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: true
}));

// ✅ HTML routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "Templates/index.html"));
});

app.get('/custom', (req, res) => {
  res.sendFile(path.join(__dirname, "Templates/Custom.html"));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, "Templates/about.html"));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, "Templates/contact.html"));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, "Templates/index.html"));
});

// ✅ Simple merge endpoint
app.post('/merge', upload.array('pdfs', 2), async (req, res) => {
  try {
    const file1Path = path.join(__dirname, req.files[0].path);
    const file2Path = path.join(__dirname, req.files[1].path);

    const mergedFilename = await mergePdfs(file1Path, file2Path);
    res.redirect(`/static/${mergedFilename}`);
  } catch (error) {
    console.error('Error merging PDFs:', error);
    res.status(500).send('Failed to merge PDFs.');
  }
});

// ✅ Custom page merge endpoint
app.post('/CustomMerge', upload.array('pdfs', 2), async (req, res) => {
  const { Pdf1Start, Pdf1End, Pdf2Start, Pdf2End } = req.body;

  if (!Pdf1Start || !Pdf1End || !Pdf2Start || !Pdf2End) {
    return res.status(400).send('Please provide all the page range values.');
  }

  try {
    const file1Path = path.join(__dirname, req.files[0].path);
    const file2Path = path.join(__dirname, req.files[1].path);

    const customMergedFilename = await CustomMerger(
      file1Path,
      file2Path,
      parseInt(Pdf1Start),
      parseInt(Pdf1End),
      parseInt(Pdf2Start),
      parseInt(Pdf2End)
    );

    res.redirect(`/static/${customMergedFilename}`);
  } catch (error) {
    console.error('Error during custom PDF merge:', error);
    res.status(500).send('Error during custom PDF merge.');
  }
});

// ✅ Contact form
app.post('/submit', (req, res) => {
  const { username, phone, email } = req.body;

  if (!username || !phone || !email) {
    return res.status(400).send('Missing required fields');
  }

  if (req.session.userDetails) {
    const stored = req.session.userDetails;
    if (stored.name === username && stored.phone === phone && stored.email === email) {
      return res.send('This information has already been submitted.');
    }
  }

  req.session.userDetails = { name: username, phone, email };
  res.redirect('/home?submitted=true');
});

// ✅ Server
app.listen(port, () => {
  console.log(`✅ PDFXMerger running on http://localhost:${port}`);
});
