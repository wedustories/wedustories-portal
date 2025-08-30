const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// admin-only routes to manage users
router.get('/', protect, authorize('admin'), userCtrl.listUsers);
router.get('/:id', protect, authorize('admin','editor'), userCtrl.getUser);
router.patch('/:id/role', protect, authorize('admin'), userCtrl.updateRole);

module.exports = router;
