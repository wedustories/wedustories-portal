// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import teamRoutes from "./routes/team.js";
import bookingRoutes from "./routes/booking.js";
import testRoutes from "./routes/test.js";

dotenv.config();
const app = express();

// __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/test", testRoutes);

// Root route
app.get("/", (req, res) => res.send("✅ Wed U Stories Backend running"));

// Connect DB & start server
const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
    process.exit(1);
  });
