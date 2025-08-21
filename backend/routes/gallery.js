const Gallery = require('../models/Gallery');
const express = require('express');
const router = express.Router();

// Dummy photo data for testing frontend
router.get('/photos', (req, res) => {
  const dummyPhotos = [
    { filename: 'photo1.jpg', url: 'https://via.placeholder.com/300x200?text=Photo+1' },
    { filename: 'photo2.jpg', url: 'https://via.placeholder.com/300x200?text=Photo+2' },
    { filename: 'photo3.jpg', url: 'https://via.placeholder.com/300x200?text=Photo+3' }
  ];
  res.json(dummyPhotos);
});

// Seed route to populate database with sample gallery entries
router.get('/seed', async (req, res) => {
  try {
    const sample = [
      { title: 'Bride Entry', filename: 'bride.jpg' },
      { title: 'Couple Shoot', filename: 'couple.jpg' },
    ];
    await Gallery.insertMany(sample);
    res.send('Dummy data added');
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).send('Error adding dummy data');
  }
});

module.exports = router;
