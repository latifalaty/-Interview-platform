const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    salary: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    }
});

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;
