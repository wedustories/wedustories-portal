// backend/routes/bookings.js
const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");

// ✅ Create booking
router.post("/", async (req, res) => {
  try {
    const { clientName, email, phone, date, packageType, notes } = req.body;

    // Basic validation
    if (!clientName || !email || !phone || !date || !packageType) {
      return res.status(400).json({ error: "Please fill all required fields" });
    }

    // Create booking document
    const newBooking = new Booking({
      clientName: clientName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      date: new Date(date), // Ensure date object
      packageType: packageType.trim(),
      notes: notes ? notes.trim() : ""
    });

    // Save booking
    const savedBooking = await newBooking.save();
    res.status(201).json({ success: true, booking: savedBooking });

  } catch (err) {
    console.error("Error saving booking:", err);
    res.status(500).json({ error: "Failed to save booking" });
  }
});

// ✅ Get all bookings
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ date: 1 });
    res.json({ success: true, bookings });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

module.exports = router;
