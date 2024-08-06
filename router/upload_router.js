const express = require("express");
const router = express.Router();
const multer = require("multer");
const Image = require("../models/file"); // Adjust the path if necessary
const authenticateToken = require("../middleware/authenticateToken");


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

// Upload single file
router.post("/single", authenticateToken, upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }

    const newImage = new Image({
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        imageBuffer: req.file.buffer,
        created_by: req.user ? req.user.id : null,
    });

    newImage.save()
        .then(() => {
            res.status(200).send("File uploaded successfully.");
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send("Error saving file to database.");
        });
});

// Upload multiple files
router.post("/multiple", upload.array("files", 100), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send("No files uploaded.");
    }

    // Map through the files and create Image instances
    const imagePromises = req.files.map((file) => {
        const newImage = new Image({
            filename: file.originalname,
            contentType: file.mimetype,
            imageBuffer: file.buffer,
            created_by: req.user ? req.user.userId : null,
        });
        return newImage.save();
    });

    // Save all images to the database
    Promise.all(imagePromises)
        .then(() => {
            res.status(200).send("Files uploaded successfully.");
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send("Error saving files to database.");
        });
});

module.exports = router;
