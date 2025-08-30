const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

module.exports = async function connectDB() {
  const uri = process.env.MONGO_URI;
  if(!uri) throw new Error('MONGO_URI missing in .env');
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('✅ MongoDB connected');
};
