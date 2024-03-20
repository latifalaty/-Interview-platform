const mongoose = require('mongoose');

// Définition du schéma de la collection QuestionRéponse
const questionReponseSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    reponse: {
        type: String,
        required: true
    }
});

// Création du modèle QuestionRéponse à partir du schéma
const QuestionReponse = mongoose.model('QuestionReponse', questionReponseSchema);

module.exports = QuestionReponse;
