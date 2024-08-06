const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  contentType: { type: String, required: true },
  imageBuffer: { type: Buffer, required: true },
  created_by: { type: String, required: true,ref: "user" }
});

module.exports = mongoose.model("Image", imageSchema);
