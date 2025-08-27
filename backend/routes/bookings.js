// backend/routes/bookings.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const controller = require('../controllers/bookingController');

// Simple auth & admin placeholders (replace with your real middleware)
const auth = (req, res, next) => {
  // If you have JWT/session, decode and set req.user
  // For now optionally set a dummy user for testing:
  // req.user = { _id: '64abc...', name: 'Admin' };
  next();
};
const adminOnly = (req, res, next) => {
  // check req.user.role === 'admin'
  next();
};

// Multer storage for booking attachments
const uploadDir = path.join(__dirname, '..', 'uploads', 'bookings');
require('fs').mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadDir); },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ storage });

// Routes
router.post('/', auth, controller.createBooking);                         // create
router.get('/', auth, controller.listBookings);                           // list + filters
router.get('/:id', auth, controller.getBookingById);                      // internal get
router.get('/:id/public', controller.getBookingPublic);                   // public redacted

router.put('/:id', auth, controller.updateBooking);                       // update
router.patch('/:id', auth, controller.updateBooking);                     // partial update

router.patch('/:id/assign', auth, controller.assignTeam);                 // assign team entries
router.post('/:id/payments', auth, controller.addPayment);                // add payment
router.post('/:id/attachments', auth, upload.array('files', 10), controller.uploadAttachments); // upload files

router.patch('/:id/soft-delete', auth, controller.softDelete);
router.patch('/:id/restore', auth, controller.restore);
router.delete('/:id', auth, adminOnly, controller.deleteBooking);         // hard delete (admin)

module.exports = router;

