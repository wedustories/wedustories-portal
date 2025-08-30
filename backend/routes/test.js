const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/public', (req, res) => res.json({ msg: 'public ok' }));
router.get('/user', protect, (req, res) => res.json({ msg: `hello ${req.user.name}`, user: req.user }));
router.get('/admin-only', protect, authorize('admin'), (req, res) => res.json({ msg: 'admin ok' }));

module.exports = router;
