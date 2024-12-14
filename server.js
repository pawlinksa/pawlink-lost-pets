const express = require('express');
const fs = require('fs');
const path = require('path');
const firebaseAdmin = require('firebase-admin');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Firebase Admin SDK
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(require('./serviceAccountKey.json')), // Update the path if needed
  databaseURL: 'https://your-database-name.firebaseio.com', // Replace with your Firebase database URL
});

// Middleware to parse form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Force HTTPS in production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

// Serve static files
app.use(express.static(__dirname)); // Serves files like `index.html` and generated HTML files

// Serve the main form page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle form submission to create HTML files
app.post('/generate', (req, res) => {
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
  <title>Tag ddasda</title>

  <!-- Firebase SDK for Firebase v9 or later -->
  <script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
    import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

    const firebaseConfig = {
      apiKey: "AIzaSyBXmhD-t6oS6vOe_CAFc9DUCoP0EmS_4Dk",
      authDomain: "pawlink-4136f.firebaseapp.com",
      projectId: "pawlink-4136f",
      storageBucket: "pawlink-4136f.firebasestorage.app",
      messagingSenderId: "87083774223",
      appId: "1:87083774223:web:50b19b7a6e2831dde98e7a",
      measurementId: "G-8VE5KFBPLD"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    window.storeMessage = async function() {
      const name = document.getElementById('name').value;
      const surname = document.getElementById('surname').value;
      const contact = document.getElementById('contact').value;

      const tagNumber = '${tagNumber}';  // Dynamic tag number
      const email = '${email}';  // Dynamic email

      try {
        await addDoc(collection(db, "lostDogs"), {
          tagNumber: tagNumber,
          OwnerEmail: email,
          name: name,
          surname: surname,
          contact: contact,
          timestamp: serverTimestamp()
        });
        alert('Lost dog report stored successfully!');
        document.getElementById('lostDogForm').reset();
      } catch (error) {
        console.error('Error storing message:', error);
        alert('Error storing message.');
      }
    }
  </script>

  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f4f4f9;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }

    h1 {
      color: #3B9D68;
      font-size: 2.5rem;
      margin-bottom: 20px;
      text-align: center;
      font-weight: bold;
    }

    h2 {
      color: #333;
      font-size: 1.8rem;
      margin-bottom: 15px;
      text-align: center;
    }

    .btn {
      background-color: #3B9D68;
      color: white;
      padding: 12px 25px;
      font-size: 1.1rem;
      border: none;
      cursor: pointer;
      border-radius: 8px;
      text-decoration: none;
      margin: 10px;
      transition: background-color 0.3s ease;
    }

    .btn:hover {
      background-color: #358a57;
    }

    .form-container {
      background-color: white;
      padding: 25px;
      border-radius: 12px;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      max-width: 450px;
      width: 100%;
      margin-top: 25px;
      transition: transform 0.3s ease;
    }

    .form-container:hover {
      transform: scale(1.02);
    }

    .form-container input {
      width: 100%;
      padding: 12px;
      margin: 12px 0;
      border-radius: 8px;
      border: 1px solid #ddd;
      font-size: 1rem;
      box-sizing: border-box;
    }

    .form-container button {
      background-color: #3B9D68;
      color: white;
      padding: 15px;
      font-size: 1.2rem;
      border: none;
      border-radius: 8px;
      width: 100%;
      cursor: pointer;
      margin-top: 15px;
      transition: background-color 0.3s ease;
    }

    .form-container button:hover {
      background-color: #358a57;
    }

    /* Responsive Design */
    @media (max-width: 600px) {
      h1 {
        font-size: 2rem;
      }

      .form-container {
        padding: 20px;
        width: 90%;
      }

      .btn {
        font-size: 1rem;
        padding: 10px 20px;
      } 
    }
  </style>
</head>
<body>
  <h1>PawLink</h1>
  <h1>Where Your Pet’s Safety is Just a Tap Away</h1>
  <a href="https://pawlink.site" class="btn">Buy Your Own</a>

  <h2>Lost Dog Report</h2>

  <div class="form-container">
    <form id="lostDogForm">
      <label for="name">Name:</label>
      <input type="text" id="name" required>

      <label for="surname">Surname:</label>
      <input type="text" id="surname" required>

      <label for="contact">Contact (email or phone):</label>
      <input type="text" id="contact" required>

      <button type="button" onclick="storeMessage()">Submit</button>
    </form>
  </div>
</body>
</html>

  `;

  // Save the file in the server directory
  const filePath = path.join(__dirname, `${tagNumber}.html`);
  fs.writeFile(filePath, tagPageContent, (err) => {
    if (err) {
      return res.status(500).send('Error creating the file.');
    }

    // Send a link to download the generated file
   
  });
});

// Store message to Firestore under the 'lostDogs' collection
app.post('/storeMessage', (req, res) => {
  const { tagNumber, email } = req.body;
  if (!tagNumber || !email) {
    return res.status(400).send('Missing tag number or email.');
  }

  const db = firebaseAdmin.firestore();
  db.collection('lostDogs').add({
    tagNumber: tagNumber,
    email: email,
    message: 'Dog Lost',
    timestamp: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
  })
  .then(() => res.status(200).send('Message stored successfully.'))
  .catch((error) => {
    console.error('Error storing message: ', error);
    res.status(500).send('Error storing message.');
  });
});

// Serve the HTML file for download
app.use(express.static(__dirname)); // This will serve the files like `tagNumber.html` from the root folder

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
