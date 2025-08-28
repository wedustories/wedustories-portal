// backend/routes/bookingRoutes.js
const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const Booking = require("../models/bookingModel");
const controller = require("../controllers/bookingController");

// ===== Dummy auth & role middlewares (replace with real JWT/session auth) =====
const auth = (req, res, next) => {
  // Example: req.user = { _id: '64abc...', role: 'manager' };
  next();
};
const adminOnly = (req, res, next) => {
  // if (req.user.role !== 'admin') return res.status(403).json({ message: "Forbidden" });
  next();
};
const managerOrAbove = (req, res, next) => {
  // if (!["admin","manager","ceo"].includes(req.user.role)) return res.status(403).json({ message: "Not allowed" });
  next();
};

// ===== Multer setup for attachments =====
const uploadDir = path.join(__dirname, "..", "uploads", "bookings");
require("fs").mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({ storage });

// ===== Booking Routes =====

// ➡️ Create Booking
router.post("/", auth, controller.createBooking);

// ➡️ List all Bookings (Admin / Reception)
router.get("/", auth, controller.listBookings);

// ➡️ Get Booking by ID (Internal)
router.get("/:id", auth, controller.getBookingById);

// ➡️ Get Booking Public Redacted
router.get("/:id/public", controller.getBookingPublic);

// ➡️ Update Booking
router.put("/:id", auth, controller.updateBooking);
router.patch("/:id", auth, controller.updateBooking);

// ➡️ Assign Team
router.patch("/:id/assign", auth, controller.assignTeam);

// ➡️ Add Payment
router.post("/:id/payments", auth, controller.addPayment);

// ➡️ Upload Attachments
router.post("/:id/attachments", auth, upload.array("files", 10), controller.uploadAttachments);

// ➡️ Soft Delete / Restore
router.patch("/:id/soft-delete", auth, controller.softDelete);
router.patch("/:id/restore", auth, controller.restore);

// ➡️ Cancel / Postpone (Manager or Admin only)
router.patch("/:id/cancel", auth, managerOrAbove, controller.cancelBooking);
router.patch("/:id/postpone", auth, managerOrAbove, controller.postponeBooking);

// ➡️ Hard Delete (Admin only)
router.delete("/:id", auth, adminOnly, controller.deleteBooking);

module.exports = router;
