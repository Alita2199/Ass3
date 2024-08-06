const express = require("express");
const router = express.Router();
const File = require("../models/file");
const ITEMS_PER_PAGE = 2; 

// Fetch single random file
router.get("/", async (req, res) => {
  try {
    const file = await File.aggregate([{ $sample: { size: 1 } }]);
    if (!file.length) {
      return res.status(404).send("No file found.");
    }
    const formattedFile = {
      filename: file[0].filename,
      contentType: file[0].contentType,
      imageBuffer: file[0].imageBufferThumbnail
        ? file[0].imageBufferThumbnail.toString("base64")
        : file[0].imageBuffer.toString("base64"),
    };
    res.json(formattedFile);
  } catch (error) {
    console.error("Error finding document:", error);
    res.status(500).send("Error fetching file.");
  }
});

// Fetch multiple files
router.get("/multiple", async (req, res) => {
  const count = parseInt(req.query.count, 10) || 2;
  try {
    const files = await File.aggregate([{ $sample: { size: count } }]);
    const formattedFiles = files.map((file) => ({
      filename: file.filename,
      contentType: file.contentType,
      imageBuffer: file.imageBufferThumbnail
        ? file.imageBufferThumbnail.toString("base64")
        : file.imageBuffer.toString("base64"),
    }));
    res.json(formattedFiles);
  } catch (error) {
    console.error("Error finding documents:", error);
    res.status(500).send("Error fetching files.");
  }
});

// Fetch all files as base64
router.get("/all", async (req, res) => {
  try {
    const files = await File.find();
    if (!files.length) {
      return res.status(404).send("No files found.");
    }
    const formattedFiles = files.map((file) => ({
      filename: file.filename,
      contentType: file.contentType,
      imageBuffer: file.imageBufferThumbnail
        ? file.imageBufferThumbnail.toString("base64")
        : file.imageBuffer.toString("base64"),
    }));
    res.json(formattedFiles);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).send("Error fetching files.");
  }
});

// Fetch paginated files
router.get("/all/pages/:index", async (req, res) => {
  const pageIndex = parseInt(req.params.index, 10);
  if (isNaN(pageIndex) || pageIndex < 1) {
    return res.status(400).send("Invalid page index.");
  }

  try {
    const totalItems = await File.countDocuments();
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    if (pageIndex > totalPages) {
      return res.status(404).send("Page not found.");
    }

    const files = await File.find()
      .skip((pageIndex - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    const formattedFiles = files.map((file) => ({
      filename: file.filename,
      contentType: file.contentType,
      imageBuffer: file.imageBufferThumbnail
        ? file.imageBufferThumbnail.toString("base64")
        : file.imageBuffer.toString("base64"),
    }));

    const response = {
      page: pageIndex,
      totalPages: totalPages,
      files: formattedFiles,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching paginated files:", error);
    res.status(500).send("Error fetching files.");
  }
});

module.exports = router;