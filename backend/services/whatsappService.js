// backend/services/whatsappService.js
import axios from "axios";
import EventEmitter from "events";

class WhatsAppService extends EventEmitter {
  constructor() {
    super();
    this.apiUrl = "https://graph.facebook.com/v20.0";
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!this.phoneNumberId || !this.accessToken) {
      console.warn("⚠️ WhatsAppService: Missing credentials in env");
    }
  }

  // ✅ Send WhatsApp Text Message
  async sendMessage(to, message) {
    try {
      const res = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: message },
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      this.emit("message:sent", { to, message, response: res.data });
      return res.data;
    } catch (error) {
      this.emit("error", { action: "sendMessage", error });
      throw error;
    }
  }

  // ✅ Send WhatsApp Template Message
  async sendTemplate(to, templateName, lang = "en_US", components = []) {
    try {
      const res = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: "whatsapp",
          to,
          type: "template",
          template: {
            name: templateName,
            language: { code: lang },
            components,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      this.emit("template:sent", {
        to,
        template: templateName,
        response: res.data,
      });
      return res.data;
    } catch (error) {
      this.emit("error", { action: "sendTemplate", error });
      throw error;
    }
  }

  // ✅ Receive Webhook Events (to be called from controller)
  handleWebhookEvent(event) {
    try {
      if (event.entry && event.entry[0]?.changes) {
        const changes = event.entry[0].changes;
        changes.forEach((change) => {
          if (change.value?.messages) {
            change.value.messages.forEach((msg) => {
              this.emit("message:received", msg);
            });
          }
        });
      }
    } catch (error) {
      this.emit("error", { action: "handleWebhookEvent", error });
    }
  }
}

const whatsappService = new WhatsAppService();
export default whatsappService;
