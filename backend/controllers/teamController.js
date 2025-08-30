const TeamMember = require('../models/TeamMember');
const Booking = require('../models/Booking');

exports.addMember = async (req, res) => {
  const m = await TeamMember.create(req.body);
  res.status(201).json(m);
};

exports.listMembers = async (req, res) => {
  const q = req.query.city ? { city: req.query.city } : {};
  const list = await TeamMember.find(q).limit(500);
  res.json(list);
};

exports.assignToBooking = async (req, res) => {
  // body: { bookingId, memberId }
  const { bookingId, memberId } = req.body;
  const booking = await Booking.findById(bookingId);
  if(!booking) return res.status(404).json({ message: 'Booking not found' });
  booking.assignedTeam = booking.assignedTeam || [];
  if(booking.assignedTeam.includes(memberId)) return res.status(400).json({ message: 'Already assigned' });
  booking.assignedTeam.push(memberId);
  await booking.save();
  res.json(booking);
};
