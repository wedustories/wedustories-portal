const express = require('express');
const router = express.Router();
const bookingCtrl = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, bookingCtrl.createBooking);
router.get('/', protect, bookingCtrl.listBookings);
router.get('/:id', protect, bookingCtrl.getBooking);
router.patch('/:id', protect, authorize('admin','editor'), bookingCtrl.updateBooking);

module.exports = router;
