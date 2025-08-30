const User = require('../models/User');

exports.listUsers = async (req, res) => {
  const users = await User.find().select('-password').limit(200);
  res.json(users);
};

exports.getUser = async (req, res) => {
  const u = await User.findById(req.params.id).select('-password');
  if(!u) return res.status(404).json({ message: 'User not found' });
  res.json(u);
};

exports.updateRole = async (req, res) => {
  const { role } = req.body;
  if(!['admin','editor','client'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
  const u = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
  res.json(u);
};
