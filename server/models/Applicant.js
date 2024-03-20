const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    offerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer',
        required: true
    },
    cv: {
        type: String,
        required: true
    }
});

const Applicant = mongoose.model('Applicant', applicantSchema);

module.exports = Applicant;
