import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import bookingRoutes from "./routes/bookingRoutes.js";
import userRoutes from "./routes/userRoutes.js"; // placeholder for auth/roles

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// static uploads
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// API routes
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes); // basic user/role routes placeholder

// simple root
app.get("/", (req, res) => res.send("✅ Wed U Stories Backend running"));

// Connect mongo and start
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=>app.listen(PORT, ()=>console.log(`Server running http://localhost:${PORT}`)))
  .catch(err => { console.error("Mongo connect error:", err.message); process.exit(1); });
