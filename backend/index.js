// server.js

const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const path = require('path');
const fs = require('fs')

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

// MongoDB connection setup
mongoose
  .connect(
    "mongodb+srv://ashaduzzaman2002:EyuL7QkAKB7eNi9P@cluster0.enexbnu.mongodb.net/?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("DB is connected"))
  .catch((err) => console.log(err));

// Middleware for parsing JSON and handling file uploads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/images', express.static('images'));

// Define a storage strategy for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'images/')
  },
  filename: (req, file, cb) => {
      const index = file.originalname.lastIndexOf('.')
      const ext = file.originalname.slice(index)

      const filename = generateId() + ext

      console.log(filename)
      cb(null, filename);
  }
})

function generateId(max = 30) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let tempId = ''
  for (let index = 0; index < max; index++) {
      const i = Math.floor(Math.random() * characters.length)
      tempId += characters[i]
  }

  return tempId
}

const upload = multer({ storage });

const checkImageUpload = (req, res, next) => {
 
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      error: 'Invalid file type. Only images (jpeg, png, gif) are allowed.',
    });
  }

  next();
};


// Define your API routes for user registration and file upload here
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { name } = req.body;
    const path = req.file.path;

    // // Save file information to the database
    // const newFile = new File({ name, path });
    // await newFile.save();
    console.log(name, path);

    res.status(201).json({ msg: "Success" });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "File upload failed" });
  }
});


app.delete('/api/delete-all-files', (req, res) => {
  const publicFolderPath = path.join(__dirname, 'images');

  // Read the contents of the 'public' directory
  fs.readdir(publicFolderPath, (err, files) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading directory' });
    }

    // Iterate over the files and delete each one
    files.forEach(file => {
      const filePath = path.join(publicFolderPath, file);
      fs.unlinkSync(filePath);
    });

    res.status(200).json({ message: 'All files deleted successfully' });
  });
});

app.get('/', (req, res) => res.send('Hello World'))

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
