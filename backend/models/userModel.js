import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "editor", "client"],
      default: "client", // ✅ har naya user client banega
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
