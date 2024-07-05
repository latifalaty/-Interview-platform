const mongoose = require('mongoose');

const technicalItemSchema = new mongoose.Schema({
    domain: {
        type: String,
        required: true,
        enum: ['IT', 'Finance', 'Marketing', 'Engineering', 'Sales', 'HR'],
    },
    problem: {
        type: String,
        required: true,
    },
    solution: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const TechnicalItem = mongoose.model('TechnicalItem', technicalItemSchema);

module.exports = TechnicalItem;