// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  // store role as ObjectId refering to UserRole
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'UserRole', required: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
