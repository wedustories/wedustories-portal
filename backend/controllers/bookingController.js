// backend/controllers/bookingController.js
const path = require('path');
const fs = require('fs');
const Booking = require('../models/booking');

// Helper to send standardized errors
const sendError = (res, code, msg) => res.status(code).json({ error: msg });

// Create booking
exports.createBooking = async (req, res) => {
  try {
    // req.body expected to contain name,email,date,package,items,phone,notes,...
    const payload = req.body || {};
    // If dates are strings, convert
    if (payload.date) payload.date = new Date(payload.date);
    if (payload.endDate) payload.endDate = new Date(payload.endDate);

    // createdBy from auth (if available)
    if (req.user && req.user._id) payload.createdBy = req.user._id;

    const booking = await Booking.create(payload);
    // optional audit
    if (booking.logAction) booking.logAction({ actor: req.user?._id, actorName: req.user?.name, action: 'created' });
    return res.status(201).json(booking);
  } catch (err) {
    console.error('createBooking:', err);
    return sendError(res, 400, err.message || 'Create booking failed');
  }
};

// Get single booking (internal)
exports.getBookingById = async (req, res) => {
  try {
    const id = req.params.id;
    const booking = await Booking.findById(id).populate('createdBy updatedBy deletedBy customerId assignedTeam.member');
    if (!booking) return sendError(res, 404, 'Booking not found');
    return res.json(booking);
  } catch (err) {
    console.error('getBookingById:', err);
    return sendError(res, 400, 'Invalid id');
  }
};

// Public redacted view
exports.getBookingPublic = async (req, res) => {
  try {
    const id = req.params.id;
    const booking = await Booking.findById(id);
    if (!booking) return sendError(res, 404, 'Booking not found');
    return res.json(booking.toRedactedJSON('public'));
  } catch (err) {
    console.error('getBookingPublic:', err);
    return sendError(res, 400, 'Invalid id');
  }
};

// List (pagination + filters + search)
exports.listBookings = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.max(5, Math.min(100, parseInt(req.query.limit || '10')));
    const skip = (page - 1) * limit;

    const filter = { isDeleted: { $ne: true } };

    if (req.query.status) filter.status = req.query.status;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
    if (req.query.email) filter.email = req.query.email;
    if (req.query.dateFrom || req.query.dateTo) {
      filter.date = {};
      if (req.query.dateFrom) filter.date.$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo) filter.date.$lte = new Date(req.query.dateTo);
    }
    if (req.query.search) {
      const q = req.query.search;
      filter.$or = [
        { name: new RegExp(q, 'i') },
        { email: new RegExp(q, 'i') },
        { package: new RegExp(q, 'i') },
        { 'assignedTeam.freelancerName': new RegExp(q, 'i') },
      ];
    }

    const [total, docs] = await Promise.all([
      Booking.countDocuments(filter),
      Booking.find(filter).sort({ date: -1 }).skip(skip).limit(limit),
    ]);

    return res.json({ page, limit, total, data: docs });
  } catch (err) {
    console.error('listBookings:', err);
    return sendError(res, 500, 'List failed');
  }
};

// Update booking fully (PUT) or partially (PATCH uses same)
exports.updateBooking = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body || {};
    if (updates.date) updates.date = new Date(updates.date);
    const booking = await Booking.findById(id);
    if (!booking) return sendError(res, 404, 'Booking not found');

    // keep audit: record changes
    const old = booking.toObject();
    Object.assign(booking, updates);
    booking.updatedBy = req.user?._id;
    booking.logAction({ actor: req.user?._id, actorName: req.user?.name, action: 'updated', changes: { before: old, after: updates } });

    await booking.save();
    return res.json(booking);
  } catch (err) {
    console.error('updateBooking:', err);
    return sendError(res, 400, err.message || 'Update failed');
  }
};

// Assign team entry (push one or many)
exports.assignTeam = async (req, res) => {
  try {
    const id = req.params.id;
    const { assignedTeam } = req.body; // expect array or single object
    if (!assignedTeam) return sendError(res, 400, 'assignedTeam required');

    const booking = await Booking.findById(id);
    if (!booking) return sendError(res, 404, 'Booking not found');

    const entries = Array.isArray(assignedTeam) ? assignedTeam : [assignedTeam];
    entries.forEach((e) => {
      booking.assignedTeam.push(e);
    });

    booking.logAction({ actor: req.user?._id, actorName: req.user?.name, action: 'assigned', changes: { assignedTeam: entries } });
    await booking.save();
    return res.json(booking);
  } catch (err) {
    console.error('assignTeam:', err);
    return sendError(res, 400, err.message || 'Assign failed');
  }
};

// Add payment
exports.addPayment = async (req, res) => {
  try {
    const id = req.params.id;
    const payment = req.body;
    if (!payment || typeof payment.amount !== 'number') return sendError(res, 400, 'payment.amount required');

    const booking = await Booking.findById(id);
    if (!booking) return sendError(res, 404, 'Booking not found');

    if (!payment.paidAt && (payment.status === 'paid' || payment.status === 'authorized')) payment.paidAt = new Date();
    booking.payments.push(payment);
    booking.logAction({ actor: req.user?._id, actorName: req.user?.name, action: 'payment_added', changes: payment });
    await booking.save();
    return res.json(booking);
  } catch (err) {
    console.error('addPayment:', err);
    return sendError(res, 400, err.message || 'Add payment failed');
  }
};

// Upload attachments (multer will put files on req.files)
exports.uploadAttachments = async (req, res) => {
  try {
    const id = req.params.id;
    const files = req.files || [];
    if (!files.length) return sendError(res, 400, 'No files uploaded');

    const booking = await Booking.findById(id);
    if (!booking) return sendError(res, 404, 'Booking not found');

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    files.forEach((f) => {
      const attachment = {
        filename: f.originalname,
        url: `${baseUrl}/uploads/bookings/${f.filename}`,
        size: f.size,
        mimeType: f.mimetype,
        storage: 'local',
        checksum: '',
        uploadedBy: req.user?._id,
      };
      booking.attachments.push(attachment);
    });

    booking.logAction({ actor: req.user?._id, actorName: req.user?.name, action: 'attachment_added', changes: { count: files.length } });
    await booking.save();
    return res.json(booking);
  } catch (err) {
    console.error('uploadAttachments:', err);
    return sendError(res, 500, 'Upload failed');
  }
};

// Soft delete
exports.softDelete = async (req, res) => {
  try {
    const id = req.params.id;
    const booking = await Booking.findById(id);
    if (!booking) return sendError(res, 404, 'Booking not found');

    booking.softDelete(req.user?._id);
    await booking.save();
    return res.json({ ok: true, message: 'Soft deleted' });
  } catch (err) {
    console.error('softDelete:', err);
    return sendError(res, 500, 'Delete failed');
  }
};

// Restore
exports.restore = async (req, res) => {
  try {
    const id = req.params.id;
    const booking = await Booking.findById(id);
    if (!booking) return sendError(res, 404, 'Booking not found');

    booking.restore(req.user?._id);
    await booking.save();
    return res.json({ ok: true, message: 'Restored' });
  } catch (err) {
    console.error('restore:', err);
    return sendError(res, 500, 'Restore failed');
  }
};

// Hard delete (ADMIN ONLY) - be careful
exports.deleteBooking = async (req, res) => {
  try {
    const id = req.params.id;
    await Booking.findByIdAndDelete(id);
    return res.json({ ok: true, message: 'Deleted' });
  } catch (err) {
    console.error('deleteBooking:', err);
    return sendError(res, 500, 'Delete failed');
  }
};
