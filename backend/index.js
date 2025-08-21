// Pehle se imports aur setup
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const Package = require('./models/Package');
const Booking = require('./models/Booking');

dotenv.config();

const app = express(); // yahan app banega pehle
const PORT = process.env.PORT || 5000;

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

app.use(helmet());
app.use(morgan('combined')); // request logs

// Rate limiting (e.g., 100 req/15min per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// STRICT CORS allowlist (frontend domain add karna)
const allowed = [
  'http://localhost:5173',   // Vite dev
  'https://your-frontend-domain.com' // Vercel domain (baad me)
];
app.use(require('cors')({
  origin: (origin, cb) => {
    if (!origin || allowed.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes import
const bookingRoutes = require('./routes/bookings');
app.use('/api/bookings', bookingRoutes);

// Existing root route
app.get('/', (req, res) => {
  res.send('Backend server running!');
});

// Hello route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

// Get all packages
app.get('/api/packages', async (req, res) => {
  try {
    const packages = await Package.find();
    res.json(packages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

// Create new package (admin only)
app.post('/api/packages', async (req, res) => {
  try {
    const newPackage = new Package(req.body);
    const savedPackage = await newPackage.save();
    res.status(201).json(savedPackage);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create package' });
  }
});

// Get package by id
app.get('/api/packages/:id', async (req, res) => {
  try {
    const pack = await Package.findById(req.params.id);
    if (pack) res.json(pack);
    else res.status(404).json({ error: 'Package not found' });
  } catch (err) {
    res.status(400).json({ error: 'Invalid package id' });
  }
});

// Booking form submit (ye ab route file me shift ho jayega)
app.post('/api/bookings', async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    const savedBooking = await newBooking.save();
    res.status(201).json({ message: 'Booking successful', booking: savedBooking });
  } catch (err) {
    res.status(400).json({ error: 'Failed to save booking' });
  }
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is connected to MongoDB!' });
});

// Server start
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
