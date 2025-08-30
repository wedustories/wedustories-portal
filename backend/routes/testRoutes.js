import express from "express";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Sirf logged-in users ke liye
router.get("/user", authMiddleware, (req, res) => {
  res.json({ message: `Welcome ${req.user.name}, you are a ${req.user.role}` });
});

// ✅ Sirf ADMIN ke liye
router.get("/admin", authMiddleware, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Welcome Admin! You have full access." });
});

// ✅ Sirf EDITOR ke liye
router.get("/editor", authMiddleware, authorizeRoles("editor"), (req, res) => {
  res.json({ message: "Welcome Editor! You can manage content." });
});

export default router;
