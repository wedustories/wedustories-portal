import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: process.env.PORT || 8080,
  mongo: process.env.MONGO_URI,
  jwt: process.env.JWT_SECRET,
  baseUrl: process.env.BASE_URL || 'http://localhost:8080',
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  msgProvider: (process.env.MSG_PROVIDER || 'none').toLowerCase(),
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER,
    smsNumber: process.env.TWILIO_SMS_NUMBER
  },
  gupshup: {
    apiKey: process.env.GUPSHUP_API_KEY
  },
  agent: {
    mode: process.env.AGENT_MODE || 'local',
    vectorDb: process.env.VECTOR_DB_URL || null,
    embeddingModel: process.env.EMBEDDING_MODEL || 'local'
  }
};
