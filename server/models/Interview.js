const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  email: { type: String, required: true },
  date: { type: Date, required: true },
  link: { type: String, required: true },
  domain: { type: String, required: true },
  roomnumber: { type: String } // Champ "roomnumber" ajouté
});

const Interview = mongoose.model('Interview', interviewSchema);

module.exports = Interview;
