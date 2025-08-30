const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: String,
  phone: String,
  designation: { type: String, enum: ['Photographer','Editor','Videographer','Coordinator','Makeup','Decorator','DJ'], default: 'Photographer' },
  city: String,
  available: { type: Boolean, default: true },
  freelancer: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('TeamMember', teamSchema);
