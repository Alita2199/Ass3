const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Upload schema
const uploadSchema = new Schema({
  filename: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
  // Add more fields as needed
});

// Create and export the Upload model
module.exports = mongoose.model('Upload', uploadSchema);
