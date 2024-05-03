const mongoose = require('mongoose');

const analysedVideoSchema = new mongoose.Schema({
  email: { type: String, required: true },
  videoUrl: { type: String, required: true },
  extractedText: { type: String, required: true }
});

const AnalysedVideo = mongoose.model('AnalysedVideo', analysedVideoSchema);

module.exports = AnalysedVideo;
