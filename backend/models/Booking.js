const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Assigned team subdocument
const AssignedTeamSchema = new Schema({
  member: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  freelancerName: { type: String, default: '' },
  role: { type: String, default: '' },
  assignedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['assigned','pending','completed'], default: 'assigned' }
});

// Payment subdocument
const PaymentSchema = new Schema({
  amount: { type: Number, required: true },
  method: { type: String, default: 'cash' },
  status: { type: String, enum: ['pending','authorized','paid'], default: 'pending' },
  paidAt: { type: Date },
  notes: { type: String, default: '' },
});

// Attachment subdocument
const AttachmentSchema = new Schema({
  filename: { type: String },
  url: { type: String },
  size: { type: Number },
  mimeType: { type: String },
  storage: { type: String, default: 'local' },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now },
});

// Booking Schema
const BookingSchema = new Schema({
  clientName: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  package: { type: String },
  services: { type: [String], default: [] },
  date: { type: Date, required: true },
  endDate: { type: Date },
  notes: { type: String, default: '' },
  assignedTeam: { type: [AssignedTeamSchema], default: [] },
  payments: { type: [PaymentSchema], default: [] },
  attachments: { type: [AttachmentSchema], default: [] },
  status: { type: String, enum: ['confirmed', 'postponed', 'pending_date','completed', 'cancelled'], default: 'confirmed' },
  postponeDate: { type: Date, default: null },
  paymentStatus: { type: String, enum: ['pending','authorized','paid'], default: 'pending' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
