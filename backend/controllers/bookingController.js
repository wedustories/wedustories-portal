const Booking = require('../models/Booking');

exports.createBooking = async (req, res) => {
  const body = req.body;
  // require clientId = req.user._id for logged-in clients; admin can create for client
  body.clientId = body.clientId || req.user._id;
  const bk = await Booking.create(body);
  res.status(201).json(bk);
};

exports.listBookings = async (req, res) => {
  // admin sees all, client sees own
  if(req.user.role === 'admin' || req.user.role === 'editor'){
    const list = await Booking.find().populate('assignedTeam').limit(200);
    return res.json(list);
  }
  const list = await Booking.find({ clientId: req.user._id }).populate('assignedTeam');
  res.json(list);
};

exports.getBooking = async (req, res) => {
  const bk = await Booking.findById(req.params.id).populate('assignedTeam');
  if(!bk) return res.status(404).json({ message: 'Not found' });
  res.json(bk);
};

exports.updateBooking = async (req, res) => {
  const bk = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(bk);
};
