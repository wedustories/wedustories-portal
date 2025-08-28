// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: token missing' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'change_this_secret';
    const decoded = jwt.verify(token, secret);

    // load user and populate role
    const user = await User.findById(decoded.id).populate('role');
    if (!user) return res.status(401).json({ message: 'Unauthorized: user not found' });

    // attach a sanitized user object to req.user
    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role ? { id: user.role._id, name: user.role.roleName, permissions: user.role.permissions } : null
    };
    next();
  } catch (err) {
    console.error('auth error', err);
    return res.status(401).json({ message: 'Unauthorized', error: err.message });
  }
};

module.exports = auth;
