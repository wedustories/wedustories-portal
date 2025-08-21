const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  customOptions: Object, // Client customization options
});

module.exports = mongoose.model('Package', packageSchema);
