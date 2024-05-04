
const mongoose = require('mongoose');

// Define schema for candidate data
const candidateDataSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    extractedText: {
        type: String,
        required: true
    },
});

// Create CandidateData model
const CandidateData = mongoose.model('Candidatenalysedvideo', candidateDataSchema);

module.exports = CandidateData;
