const express = require('express');
const router = express.Router();
const teamCtrl = require('../controllers/teamController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('admin','editor'), teamCtrl.addMember);
router.get('/', protect, authorize('admin','editor'), teamCtrl.listMembers);
router.post('/assign', protect, authorize('admin','editor'), teamCtrl.assignToBooking);

module.exports = router;
