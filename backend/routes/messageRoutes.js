const express = require("express");
const router = express.Router();
const { sendMessage, updateStatus } = require("../controllers/messageController");

router.post("/send", sendMessage);
router.post("/status", updateStatus);

module.exports = router;
