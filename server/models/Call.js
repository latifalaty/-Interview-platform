const mongoose = require('mongoose');

const callSchema = new mongoose.Schema({
    userToCall: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    signalData: {
        type: String,
        required: true
    },
    from: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Call = mongoose.model('Call', callSchema);

module.exports = Call;
