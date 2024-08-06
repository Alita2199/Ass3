require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");  // Import multer here
const User = require('./models/user'); // Import User model
const Upload = require('./models/upload'); // Import Upload model
const uploadRouter = require("./router/upload_router");
const fetchRouter = require("./router/fetch_router");
const authenticateToken = require('./middleware/authenticateToken'); // Import authenticateToken middleware

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use("/upload", uploadRouter);
app.use("/fetch", fetchRouter);
// Configure Multer to use memory storage and add file size limit and file type validation
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit files to 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    }
});
// Connect to MongoDB
const url = process.env.MONGODB_URI;

if (!url) {
  console.error("MONGODB_URI is not set in .env file");
  process.exit(1);
}

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error("DB Error:", error.message);
    process.exit(1);
  });



// User registration endpoint
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).send('User registered');
  } catch (error) {
    res.status(500).send('Error registering user');
  }
});

// User login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  console.log('Received data:', req.body); // Debugging line

  if (!username || !password) {
    console.log('Missing username or password');
    return res.status(400).send('Username and password are required');
  }

  try {
    console.log('Attempting to find user with username:', username);
    const user = await User.findOne({ username });

    if (!user) {
      console.log('User not found');
      return res.status(401).send('User not found');
    }

    console.log('User found, comparing passwords');
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      console.log('Password mismatch');
      return res.status(401).send('Invalid credentials');
    }

    console.log('Password matched, creating token');
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log(token)
    res.json({ token: token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Error logging in');
  }
});




// Serve HTML files
app.get("/", (req, res) => {
  res.redirect('/login'); // Redirect to login page if not authenticated
});

app.get("/login", (req, res) => {
  if (req.headers['authorization']) {
    return res.redirect('/index'); // Redirect to index page if authenticated
  }
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "register.html"));
});

app.get("/index", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Serve fetch-random.html
app.get("/fetch-random", (req, res) => {
  res.sendFile(path.join(__dirname, "views/fetch-random.html"));
});

// Serve fetch-multiple-random.html
app.get("/fetch-multiple-random", (req, res) => {
  res.sendFile(path.join(__dirname, "views/fetch-multiple-random.html"));
});

// Serve gallery.html
app.get("/gallery", (req, res) => {
  res.sendFile(path.join(__dirname, "views/gallery.html"));
});

// Serve gallery-pagination.html
app.get("/gallery-pagination", (req, res) => {
  res.sendFile(path.join(__dirname, "views/gallery-pagination.html"));
});


app.get("/upload/single", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "upload.html"));

});

// Route to handle file upload (for POST request)
app.post("/upload/single", upload.single("file"), (req, res) => {
  if (!req.file) {
      return res.status(400).send("No file uploaded.");
  }
  // You can add logic here to save the file to a database or storage
  res.send("File uploaded successfully.");
});
app.get("/upload/multiple", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "upload-multiple.html"));
});



// Handle 404 errors
app.use((req, res) => {
  res.status(404).send("Route does not exist on our server");
});

module.exports = app;