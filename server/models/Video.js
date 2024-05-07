const mongoose = require('mongoose');

const videoRecordSchema = new mongoose.Schema({
  email: { type: String, required: true },
  videoUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now } 
});

const VideoRecord = mongoose.model('VideoRecord', videoRecordSchema);

module.exports = VideoRecord;
