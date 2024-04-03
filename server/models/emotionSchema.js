const mongoose = require('mongoose');

const emotionSchema = new mongoose.Schema({
  emotions: [{
    emotion: String,
    percentage: Number
  }],
  timestamp: { type: Date, default: Date.now },
  email: { type: String, required: true } // Add email field
});

module.exports = mongoose.model('Emotion', emotionSchema);
