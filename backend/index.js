const express = require("express");
const mongoose = require("mongoose");
const messageRoutes = require("./routes/messageRoutes");
const HookService = require("./services/hookService");
const logger = require("./utils/logger");

const app = express();
app.use(express.json());

// MongoDB Connect
mongoose.connect("mongodb://localhost:27017/wedustories", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => logger("✅ MongoDB connected"))
.catch((err) => logger("❌ DB Error: " + err));

// Routes
app.use("/api/messages", messageRoutes);

// Example Hook Listener
HookService.on("MESSAGE_SENT", (msg) => {
  logger(`📩 Message Sent to ${msg.to}: ${msg.message}`);
});

HookService.on("MESSAGE_STATUS_UPDATE", (msg) => {
  logger(`🔄 Status Updated: ${msg.status} for ${msg._id}`);
});

// Server Start
app.listen(5000, () => logger("🚀 Server running on http://localhost:5000"));
