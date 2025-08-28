import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  email: String,
  phone: String,
  package: String,
  services: { type: [String], default: [] },
  date: { type: Date, required: true },
  endDate: Date,
  notes: { type: String, default: "" },
  oneSideOrTwo: { type: String, enum: ["one_side","two_sides"], default: "one_side" },
  location: { country: String, state: String, district: String, area: String },
  assignedTeam: { type: [Object], default: [] },
  payments: { type: [Object], default: [] },
  attachments: { type: [Object], default: [] },
  status: { type: String, enum: ["confirmed","postponed","pending_date","completed","cancelled"], default: "confirmed" },
  postponeDate: { type: Date, default: null },
  cancelReason: { type: String, default: "" },
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  cancelledAt: Date,
  paymentStatus: { type: String, enum: ["pending","authorized","paid"], default: "pending" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  // gallery controls
  freeDownloadLimit: { type: Number, default: 10 },
  requiredPercentToUnlock: { type: Number, default: 80 }
}, { timestamps: true });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
