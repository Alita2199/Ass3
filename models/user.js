const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the User schema
const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Add more fields as needed
  createdUploads: [{ type: Schema.Types.ObjectId, ref: 'Upload' }] // Reference to uploaded items
});

// Create and export the User model
module.exports = mongoose.model('User', userSchema);
