import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ReconnaissanceFacial() {
    const [emotions, setEmotions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showCamera, setShowCamera] = useState(false);
    const [result, setResult] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await axios.get('/api/emotion-detection');
            setEmotions(result.data.emotions);
            setLoading(false);
        } catch (error) {
            setError(error);
            setLoading(false);
        }
    };

    const handleRecognitionClick = () => {
        fetchData();
    };

    const handleCameraOpen = () => {
        // Code pour ouvrir la caméra (à implémenter)
        setShowCamera(true);
    };

    // Fonction pour démarrer la reconnaissance faciale
    const startFacialRecognition = () => {
        // Code pour démarrer la reconnaissance faciale (à implémenter)
        // Une fois les émotions détectées, les afficher dans le champ de résultat
        setResult('Emotions detected: ' + emotions.join(', '));
    };

    return (
        <div>
            <h1>Emotion Detection</h1>
            {showCamera ? (
                <div>
                    <button onClick={startFacialRecognition} disabled={loading}>
                        Start Facial Recognition
                    </button>
                    <div>
                        <input type="text" value={result} readOnly />
                    </div>
                </div>
            ) : (
                <button onClick={handleCameraOpen}>Open Camera</button>
            )}
        </div>
    );
}

export default ReconnaissanceFacial;
