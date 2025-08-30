import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// 🔹 Register user
export async function registerUser(userData) {
  const { email, password, role } = userData;

  const existing = await User.findOne({ email });
  if (existing) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    ...userData,
    password: hashedPassword,
    role: role || "client",
  });

  await user.save();
  return { message: "User registered successfully" };
}

// 🔹 Login user
export async function loginUser({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: "7d",
  });

  return { token, user: { id: user._id, name: user.name, role: user.role } };
}

// 🔹 Verify JWT
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
