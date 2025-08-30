const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  type: { type: String, enum: ['wedding','prewedding','reception','party','other'], default:'wedding' },
  date: { type: Date, required: true },
  area: { state: String, district: String, area: String },
  exactLocation: { lat:Number, lng:Number, address:String },
  startTime: String,
  notes: String,
  status: { type: String, enum: ['pending','confirmed','completed','cancelled'], default: 'pending' },
  assignedTeam: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TeamMember' }]
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
