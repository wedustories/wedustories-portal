const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Assigned team subdocument
const AssignedTeamSchema = new Schema({
  member: { type: Schema.Types.ObjectId, ref: 'User', default: null }, // internal staff
  freelancerName: { type: String, default: '' }, // optional for freelancers
  role: { type: String, default: '' }, // e.g., Photographer, Editor
  assignedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['assigned','pending','completed'], default: 'assigned' }
});

// Payment subdocument
const PaymentSchema = new Schema({
  amount: { type: Number, required: true },
  method: { type: String, default: 'cash' }, // cash, card, online
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

  status: { type: String, enum: ['pending','confirmed','completed','cancelled'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending','authorized','paid'], default: 'pending' },

  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },

  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
}, { timestamps: true });

// ===== Methods =====

// Soft delete
BookingSchema.methods.softDelete = function(userId){
  this.isDeleted = true;
  this.deletedAt = new Date();
  if(userId) this.deletedBy = userId;
};

// Restore
BookingSchema.methods.restore = function(userId){
  this.isDeleted = false;
  this.deletedAt = null;
  if(userId) this.updatedBy = userId;
};

// Redacted JSON for public view
BookingSchema.methods.toRedactedJSON = function(view='public'){
  if(view==='public'){
    return {
      clientName: this.clientName,
      date: this.date,
      endDate: this.endDate,
      services: this.services,
      package: this.package,
      status: this.status
    };
  }
  return this.toObject();
};

// Optional audit log placeholder
BookingSchema.methods.logAction = function(log){
  // implement your audit logging (DB collection or external service)
  // e.g., console.log('Audit:', log);
};

module.exports = mongoose.model('Booking', BookingSchema);
