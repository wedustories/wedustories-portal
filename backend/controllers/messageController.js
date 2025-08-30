const WhatsAppService = require("../services/whatsappService");

exports.sendMessage = async (req, res) => {
  try {
    const { to, text } = req.body;
    const message = await WhatsAppService.sendMessage(to, text);
    res.json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { messageId, status } = req.body;
    const message = await WhatsAppService.updateStatus(messageId, status);
    res.json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
