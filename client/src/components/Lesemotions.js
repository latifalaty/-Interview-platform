// Dans votre composant React (par exemple, EmotionComponent.js)

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EmotionComponent = () => {
    const [emotionData, setEmotionData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/emotion');
                setEmotionData(response.data);
            } catch (error) {
                console.error('Erreur lors de la récupération des données d\'émotion : ', error);
            }
        };
        fetchData();
    }, []);

    return (
        <div>
            <h1>Données d'émotion</h1>
            <ul>
                {emotionData.map(emotion => (
                    <li key={emotion._id}>
                        <p>Email: {emotion.email}</p>
                        <p>Timestamp: {new Date(emotion.timestamp).toLocaleString()}</p>
                        <p>Emotions:</p>
                        <ul>
                            {emotion.emotions.map((item, index) => (
                                <li key={index}>
                                    <p>{item.emotion}: {item.percentage}%</p>
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default EmotionComponent;
