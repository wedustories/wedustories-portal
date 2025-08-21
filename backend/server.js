const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Models
const Package = require('./models/Package');

// Load environment variables
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ====== Security & Middleware ======
app.use(helmet());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// CORS allowlist
const allowedOrigins = [
  'http://localhost:5173',
  'https://your-frontend-domain.com'
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ====== Routes ======
const authRoutes = require('./routes/auth');
const galleryRoutes = require('./routes/gallery');
const bookingRoutes = require('./routes/bookings');

app.use('/api/auth', authRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/bookings', bookingRoutes);

// ====== Extra API Endpoints ======
// Root
app.get('/', (req, res) => {
  res.send('✅ API is running...');
});

// Hello test
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

// ====== Connect to MongoDB and Start Server ======
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

