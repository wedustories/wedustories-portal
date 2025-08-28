import mongoose from "mongoose";
const userRoleSchema = new mongoose.Schema({
  roleName: { type: String, required: true, unique: true, enum: ["Admin","CEO","Manager","Reception","Client"] },
  permissions: { type: [String], default: [] }
}, { timestamps: true });

export default mongoose.model("UserRole", userRoleSchema);
