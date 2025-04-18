const express = require('express');
const path = require('path');
const multer = require('multer');
const { mergePdfs } = require('./mergepdf');
const { CustomMerger } = require('./custom');
const session = require('express-session');

const app = express();
const port = process.env.PORT || 3000; // ✅ dynamic port for Render

const upload = multer({ dest: 'uploads/' });

// ✅ Middleware
app.use('/static', express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret', // ✅ secure secret
  resave: false,
  saveUninitialized: true
}));

// ✅ Routes for pages
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

// ✅ Route for simple full merge
app.post('/merge', upload.array('pdfs', 2), async (req, res) => {
  try {
    const d = await mergePdfs(
      path.join(__dirname, req.files[0].path),
      path.join(__dirname, req.files[1].path)
    );
    res.redirect(`/static/${d}.pdf`); // ✅ relative path for Render
  } catch (error) {
    console.error('Error merging PDFs:', error);
    res.status(500).send('Failed to merge PDFs.');
  }
});

// ✅ Route for custom page merge
app.post('/CustomMerge', upload.array('pdfs', 2), async (req, res) => {
  const { Pdf1Start, Pdf1End, Pdf2Start, Pdf2End } = req.body;

  if (!Pdf1Start || !Pdf1End || !Pdf2Start || !Pdf2End) {
    return res.status(400).send('Please provide all the page range values.');
  }

  try {
    const mergedPdfPath = await CustomMerger(
      path.join(__dirname, req.files[0].path),
      path.join(__dirname, req.files[1].path),
      parseInt(Pdf1Start), parseInt(Pdf1End),
      parseInt(Pdf2Start), parseInt(Pdf2End)
    );
    res.redirect(`/static/${mergedPdfPath}`); // ✅ relative path for Render
  } catch (error) {
    console.error('Error during custom PDF merge:', error);
    res.status(500).send('Error during PDF merging.');
  }
});

// ✅ Contact form route
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

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, "Templates/index.html"));
});

// ✅ Server listen
app.listen(port, () => {
  console.log(`PDFXMerger running at http://localhost:${port}`);
});
