
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
const CandidateData = mongoose.model('CandidateData', candidateDataSchema);

module.exports = CandidateData;
