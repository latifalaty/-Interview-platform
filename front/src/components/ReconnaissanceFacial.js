import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ReconnaissanceFacial() {
    const [emotions, setEmotions] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const result = await axios.get('/api/emotion-detection');
            setEmotions(result.data.emotions);
        };
        const interval = setInterval(() => {
            fetchData();
        }, 1000); // Fetch data every second

        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <h1>Emotion Detection</h1>
            <ul>
                {emotions.map((emotion, index) => (
                    <li key={index}>{emotion}</li>
                ))}
            </ul>
        </div>
    );
};
export default ReconnaissanceFacial;
