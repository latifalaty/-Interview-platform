const mongoose = require('mongoose');

// Définir le schéma pour les données d'analyse des CV
const CvAnalysisSchema = new mongoose.Schema({
    applicantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Applicant',
        required: true
    },
    email: {
        type: String,
        required: true
    },
    extractedText: {
        type: Object,
        default: {}
    },
    extractedFacesLinks: {
        type: [String],
        default: []
    }
});

// Créer un modèle à partir du schéma
const CvAnalysis = mongoose.model('CvAnalysis', CvAnalysisSchema);

module.exports = CvAnalysis;
