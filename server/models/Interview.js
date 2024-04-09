const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  link: { type: String, required: true }
});

const Interview = mongoose.model('Interview', interviewSchema);

module.exports = Interview;