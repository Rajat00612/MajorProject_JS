
const express = require('express')
const path = require('path')
const app = express()
const multer  = require('multer')
const {mergePdfs}  = require('./mergepdf')
const {CustomMerger}  = require('./custom')
const session = require('express-session');
const upload = multer({ dest: 'uploads/' })
app.use('/static', express.static('public'))
const port = process.env.PORT || 3000;


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "templates/index.html"))
})
app.get('/custom', (req, res) => {
  res.sendFile(path.join(__dirname, "templates/Custom.html"))
})
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, "templates/about.html"))
})
app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, "templates/contact.html"))
})

 

app.post('/merge', upload.array('pdfs', 2), async (req, res, next)=> {
  console.log(req.files)
  let d = await mergePdfs(path.join(__dirname, req.files[0].path), path.join(__dirname, req.files[1].path))
  res.redirect(`http://localhost:3000/static/${d}.pdf` )
  // res.send({data: req.files})
  // req.files is array of `photos` files
  // req.body will contain the text fields, if there were any
})

app.post('/CustomMerge', upload.array('pdfs', 2), async (req, res) => {
  const { Pdf1Start, Pdf1End, Pdf2Start, Pdf2End } = req.body;

  // Ensure that we have the required page range data
  if (!Pdf1Start || !Pdf1End || !Pdf2Start || !Pdf2End) {
    return res.status(400).send('Please provide all the page range values.');
  }

  try {
    // Perform the custom merging based on user input
    const mergedPdfPath = await CustomMerger(
      path.join(__dirname, req.files[0].path), // Path for PDF 1
      path.join(__dirname, req.files[1].path), // Path for PDF 2
      parseInt(Pdf1Start), parseInt(Pdf1End), // Start and End pages for PDF 1
      parseInt(Pdf2Start), parseInt(Pdf2End)  // Start and End pages for PDF 2
    );

    // Redirect user to the merged PDF download link
    res.redirect(`http://localhost:${port}/static/${mergedPdfPath}`);
  } catch (error) {
    console.error('Error during merging PDFs:', error);
    res.status(500).send('Error during PDF merging.');
  }
});
app.post('/submit', (req, res) => {
  // Log the request body to verify data is being sent
  console.log(req.body); // This should show form data as an object

  const { username, phone, email } = req.body;

  // If the body is undefined or missing fields, return an error
  if (!username || !phone || !email) {
    return res.status(400).send('Missing required fields');
  }

  // Check if user details already exist in session
  if (req.session.userDetails) {
    const storedData = req.session.userDetails;
    if (storedData.name === username && storedData.phone === phone && storedData.email === email) {
      return res.send('This information has already been submitted.');
    }
  }

  // Store the details in session
  req.session.userDetails = { name: username, phone, email };

  // Redirect to homepage after successful form submission with a success message
  return res.redirect('/home?submitted=true');
});

// Serve the homepage (after successful submission)
app.get('/home', (req, res) => {
  const submitted = req.query.submitted; // Check if submitted query parameter is present
    res.sendFile(path.join(__dirname, "templates/index.html"))
  
  
})
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});
