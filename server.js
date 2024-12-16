const express = require('express');
const fs = require('fs');
const path = require('path');
const firebaseAdmin = require('firebase-admin');
const simpleGit = require('simple-git');
require('dotenv').config(); // To manage environment variables

const app = express();
const port = 3000;

// Initialize Firebase Admin SDK
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(require('./serviceAccountKey.json')),
  databaseURL: 'https://your-database-name.firebaseio.com', // Replace with your actual Firebase database URL
});

// Middleware to parse form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve the form page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); // Serve the form page
});

// Handle form submission to create HTML files
app.post('/generate', async (req, res) => {
  const { tagNumber, email } = req.body;
  if (!tagNumber || !email) {
    return res.status(400).send('Please provide both tag number and email.');
  }

  // Dynamic HTML content with the tagNumber and email
  const tagPageContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tag ${tagNumber}</title>
    </head>
    <body>
      <h1>Tag ${tagNumber}</h1>
      <p>Owner Email: ${email}</p>
    </body>
    </html>
  `;

  const fileName = `${tagNumber}.html`;
  const filePath = path.join(__dirname, fileName);

  try {
    // Save the file locally
    fs.writeFileSync(filePath, tagPageContent);

    // Push the file to GitHub
    const git = simpleGit();
    await git.add(fileName);
    await git.commit(`Add page for tag ${tagNumber}`);
    await git.push(`https://${process.env.GITHUB_TOKEN}@github.com/pawlinksa/pawlink-lost-pets.git`);

    // Send a success message
    res.send(`File created and pushed to GitHub: <a href="https://github.com/pawlinksa/pawlink-lost-pets/blob/main/${fileName}" target="_blank">View on GitHub</a>`);
  } catch (err) {
    console.error('Error creating or pushing file:', err);
    res.status(500).send('Error creating or pushing the file.');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
