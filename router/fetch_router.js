const express = require("express");
const router = express.Router();
const Image = require("../models/file");
const authenticateToken = require("../middleware/authenticateToken");

// Fetch a single random image for the authenticated user
router.get("/", authenticateToken, (req, res) => {
  Image.aggregate([
    { $match: { created_by: req.user.userId } }, // Filter images by user ID
    { $sample: { size: 1 } } // Randomly sample 1 image
  ])
    .then((randomImage) => {
      if (randomImage.length === 0) {
        return res.status(404).send("No files found.");
      }
      res.json(randomImage[0]);
    })
    .catch((error) => {
      console.error("Error fetching file:", error);
      res.status(500).send("Error fetching file.");
    });
});

// Fetch multiple random images for the authenticated user
router.get("/multiple", authenticateToken, (req, res) => {
  const count = parseInt(req.query.count) || 1;

  Image.aggregate([
    { $match: { created_by: req.user.userId } }, // Filter images by user ID
    { $sample: { size: count } } // Randomly sample multiple images
  ])
    .then((randomImages) => {
      if (randomImages.length === 0) {
        return res.status(404).send("No files found.");
      }
      res.json(randomImages);
    })
    .catch((error) => {
      console.error("Error fetching files:", error);
      res.status(500).send("Error fetching files.");
    });
});

// Fetch all images for the authenticated user
router.get("/all", authenticateToken, (req, res) => {
  Image.find({ created_by: req.user.userId }) // Filter images by user ID
    .then((allImages) => {
      if (allImages.length === 0) {
        return res.status(404).json({ error: "No files found." });
      }
      const formattedImages = allImages.map((image) => ({
        filename: image.filename,
        contentType: image.contentType,
        imageBuffer: image.imageBuffer ? image.imageBuffer.toString("base64") : "",
      }));

      res.json(formattedImages);
    })
    .catch((error) => {
      console.error("Error fetching files:", error);
      res.status(500).json({ error: "Error fetching files." });
    });
});

// Fetch images with pagination for the authenticated user
router.get("/all/pages/:index", authenticateToken, (req, res) => {
  const pageIndex = parseInt(req.params.index, 10);
  const ITEMS_PER_PAGE = 10;

  if (isNaN(pageIndex) || pageIndex < 1) {
    return res.status(400).send("Invalid page index.");
  }

  Image.find({ created_by: req.user.userId }, { imageBuffer: 0 }) // Filter images by user ID
    .skip((pageIndex - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .then((page_results) => {
      if (page_results.length === 0) {
        return res.status(404).send("Page not found.");
      }
      Image.countDocuments({ created_by: req.user.userId }) // Count only user's images
        .then((total_images) => {
          const totalPages = Math.ceil(total_images / ITEMS_PER_PAGE);
          const formattedPageItems = page_results.map((image) => ({
            filename: image.filename,
            contentType: image.contentType,
            imageBuffer: image.imageBuffer ? image.imageBuffer.toString("base64") : "",
          }));
          const response = {
            page: pageIndex,
            totalPages: totalPages,
            files: formattedPageItems,
          };
          res.json(response);
        })
        .catch((error) => {
          console.error("Error counting Documents:", error);
          res.status(500).send("Error fetching files.");
        });
    })
    .catch((error) => {
      console.error("Error finding Documents:", error);
      res.status(500).send("Error fetching files.");
    });
});

module.exports = router;
