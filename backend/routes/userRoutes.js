import express from "express";
import User from "../models/userModel.js";
import UserRole from "../models/userRole.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// Create a user (simple, no JWT)
router.post("/create", async (req,res)=>{
  try {
    const { name, email, password, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role });
    await user.save();
    res.json({ success:true, user });
  } catch(err) { res.status(500).json({ success:false, error: err.message }); }
});

// List roles (simple)
router.get("/roles", async (req,res)=>{
  const roles = await UserRole.find();
  res.json(roles);
});

export default router;
