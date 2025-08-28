import Booking from "../models/bookingModel.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sendError = (res, code, msg) => res.status(code).json({ success:false, error: msg });

// Create
export const createBooking = async (req, res) => {
  try {
    const payload = req.body || {};
    if(payload.date) payload.date = new Date(payload.date);
    const booking = new Booking(payload);
    await booking.save();
    booking.logAction({ actor: req.user?._id, action: "created" });
    return res.json({ success:true, booking });
  } catch(err) {
    console.error("createBooking:", err);
    return sendError(res, 500, err.message || "Create failed");
  }
};

// List
export const listBookings = async (req, res) => {
  try {
    const filter = { isDeleted: { $ne: true } };
    // minimal query params supported (status, search, dateFrom/dateTo)
    if(req.query.status) filter.status = req.query.status;
    if(req.query.search) {
      const q = req.query.search;
      filter.$or = [ { clientName: new RegExp(q,'i') }, { email: new RegExp(q,'i') }, { phone: new RegExp(q,'i') } ];
    }
    const docs = await Booking.find(filter).sort({ date: -1 });
    return res.json(docs);
  } catch(err) {
    console.error("listBookings:", err);
    return sendError(res, 500, "List failed");
  }
};

// Get by id
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if(!booking) return sendError(res, 404, "Booking not found");
    return res.json(booking);
  } catch(err) {
    console.error("getBookingById:", err);
    return sendError(res, 400, "Invalid id");
  }
};

// Public redacted
export const getBookingPublic = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if(!booking) return sendError(res, 404, "Booking not found");
    return res.json(booking.toRedactedJSON('public'));
  } catch(err) {
    console.error("getBookingPublic:", err);
    return sendError(res, 400, "Invalid id");
  }
};

// Update
export const updateBooking = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body || {};
    if(updates.date) updates.date = new Date(updates.date);
    const booking = await Booking.findById(id);
    if(!booking) return sendError(res, 404, "Booking not found");
    const old = booking.toObject();
    Object.assign(booking, updates);
    booking.updatedBy = req.user?._id;
    booking.logAction({ actor: req.user?._id, action: "updated", changes: { before: old, after: updates } });
    await booking.save();
    return res.json({ success:true, booking });
  } catch(err) {
    console.error("updateBooking:", err);
    return sendError(res, 400, err.message || "Update failed");
  }
};

// Assign team
export const assignTeam = async (req, res) => {
  try {
    const id = req.params.id;
    const { assignedTeam } = req.body;
    if(!assignedTeam) return sendError(res, 400, "assignedTeam required");
    const booking = await Booking.findById(id);
    if(!booking) return sendError(res, 404, "Booking not found");
    const entries = Array.isArray(assignedTeam) ? assignedTeam : [assignedTeam];
    entries.forEach(e => booking.assignedTeam.push(e));
    booking.logAction({ actor: req.user?._id, action: "assigned", changes: entries });
    await booking.save();
    return res.json({ success:true, booking });
  } catch(err) {
    console.error("assignTeam:", err);
    return sendError(res, 400, err.message || "Assign failed");
  }
};

// Add payment (placeholder)
export const addPayment = async (req, res) => {
  try {
    const id = req.params.id;
    const payment = req.body;
    if(!payment || typeof payment.amount !== "number") return sendError(res, 400, "payment.amount required");
    const booking = await Booking.findById(id);
    if(!booking) return sendError(res, 404, "Booking not found");
    if(!payment.paidAt && (payment.status === "paid" || payment.status === "authorized")) payment.paidAt = new Date();
    booking.payments.push(payment);
    // update paymentStatus quick logic
    if(payment.status === "paid") booking.paymentStatus = "paid";
    booking.logAction({ actor: req.user?._id, action: "payment_added", changes: payment });
    await booking.save();
    return res.json({ success:true, booking });
  } catch(err) {
    console.error("addPayment:", err);
    return sendError(res, 400, err.message || "Add payment failed");
  }
};

// Upload attachments (multer will attach files on req.files)
export const uploadAttachments = async (req, res) => {
  try {
    const id = req.params.id;
    const files = req.files || [];
    if(!files.length) return sendError(res, 400, "No files uploaded");
    const booking = await Booking.findById(id);
    if(!booking) return sendError(res, 404, "Booking not found");
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    for(const f of files) {
      const attachment = {
        filename: f.originalname,
        url: `${baseUrl}/uploads/bookings/${f.filename}`,
        size: f.size,
        mimeType: f.mimetype,
        storage: 'local',
        uploadedBy: req.user?._id
      };
      booking.attachments.push(attachment);
    }
    booking.logAction({ actor: req.user?._id, action: "attachments_added", changes: { count: files.length } });
    await booking.save();
    return res.json({ success:true, booking });
  } catch(err) {
    console.error("uploadAttachments:", err);
    return sendError(res, 500, "Upload failed");
  }
};

// Soft delete / restore
export const softDelete = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if(!booking) return sendError(res, 404, "Booking not found");
    booking.softDelete(req.user?._id);
    await booking.save();
    return res.json({ success:true, message: "Soft deleted" });
  } catch(err) {
    console.error("softDelete:", err);
    return sendError(res, 500, "Delete failed");
  }
};
export const restore = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if(!booking) return sendError(res, 404, "Booking not found");
    booking.restore(req.user?._id);
    await booking.save();
    return res.json({ success:true, message: "Restored" });
  } catch(err) {
    console.error("restore:", err);
    return sendError(res, 500, "Restore failed");
  }
};

// Cancel booking (manager/admin)
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if(!booking) return sendError(res, 404, "Booking not found");
    const { reason } = req.body;
    booking.status = "cancelled";
    booking.cancelReason = reason || "No reason provided";
    booking.cancelledBy = req.user?._id;
    booking.cancelledAt = new Date();
    booking.logAction({ actor: req.user?._id, action: "cancelled", changes: { reason } });
    await booking.save();
    return res.json({ success:true, message: "Booking cancelled", booking });
  } catch(err) {
    console.error("cancelBooking:", err);
    return sendError(res, 500, "Cancel failed");
  }
};

// Postpone booking
export const postponeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if(!booking) return sendError(res, 404, "Booking not found");
    const { postponeDate } = req.body;
    booking.status = postponeDate ? "postponed" : "pending_date";
    if(postponeDate) booking.postponeDate = new Date(postponeDate);
    booking.logAction({ actor: req.user?._id, action: "postponed", changes: { postponeDate } });
    await booking.save();
    return res.json({ success:true, message: "Booking postponed", booking });
  } catch(err) {
    console.error("postponeBooking:", err);
    return sendError(res, 500, "Postpone failed");
  }
};

// Hard delete (admin only)
export const deleteBooking = async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    return res.json({ success:true, message: "Deleted permanently" });
  } catch(err) {
    console.error("deleteBooking:", err);
    return sendError(res, 500, "Delete failed");
  }
};

/* ===== Gallery/Download helper endpoints (optional) =====
   We will provide endpoints the frontend can call to request download.
   Backend checks payment percent and returns a signed URL or message.
*/
export const requestDownload = async (req, res) => {
  try {
    const id = req.params.id;
    const booking = await Booking.findById(id);
    if(!booking) return sendError(res, 404, "Booking not found");

    // compute percent paid (simple logic: totalPaid / expected? placeholder)
    const totalPaid = booking.payments.reduce((s,p)=>s + (p.amount || 0), 0);
    // For demo: require requiredPercentToUnlock to be met — this needs actual expected amount stored in booking.itemPrice etc.
    // We'll simulate by checking paymentStatus or percent flag.
    if(booking.paymentStatus === "paid") {
      return res.json({ success:true, allowed:true, message:"Full access granted" });
    }
    // if not fully paid return limited access info
    return res.json({ success:true, allowed:false, freeLimit: booking.freeDownloadLimit, message: "Partial access only. Please complete payment to unlock full gallery." });
  } catch(err) {
    console.error("requestDownload:", err);
    return sendError(res, 500, "Download request failed");
  }
};
