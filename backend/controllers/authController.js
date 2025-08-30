const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

function generateToken(user){
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if(!name||!email||!password) return res.status(400).json({ message: 'Provide all fields' });
    const exists = await User.findOne({ email });
    if(exists) return res.status(400).json({ message: 'User already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed }); // role defaults to client
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user) });
  } catch (err) {
    console.error(err); res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if(!email||!password) return res.status(400).json({ message: 'Provide email and password' });
    const user = await User.findOne({ email });
    if(!user) return res.status(401).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if(!match) return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user) });
  } catch (err) { console.error(err); res.status(500).json({ message: err.message }); }
};

exports.profile = async (req, res) => {
  const u = await User.findById(req.user._id).select('-password');
  res.json(u);
};
