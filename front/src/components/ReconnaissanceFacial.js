import React, { useState } from 'react';
import axios from 'axios';

function ReconnaissanceFacial() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [emotions, setEmotions] = useState([]);

    const handleRecognitionClick = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/emotion-detection');
            setEmotions(response.data.emotions);
            setLoading(false);
        } catch (error) {
            console.error('Error detecting emotions:', error);
            setError('Error detecting emotions');
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Emotion Detection</h1>
            <button onClick={handleRecognitionClick} disabled={loading}>
                Start Facial Recognition
            </button>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            {console.log(emotions)}
            {emotions.length > 0 && (
                <div>
                    <h2>Detected Emotions:</h2>
                    <ul>
                        {emotions.map((emotion, index) => (
                            <li key={index}>{emotion}</li>
                            
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default ReconnaissanceFacial;
