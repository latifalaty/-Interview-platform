
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './classifier.css'; // Import the CSS file

const EmotionList = () => {
  const [emotions, setEmotions] = useState([]);

  useEffect(() => {
    const fetchEmotions = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8009/emotionanalyse');
        setEmotions(response.data);
      } catch (error) {
        console.error('Error fetching emotions:', error);
      }
    };

    fetchEmotions();
  }, []);

  return (
    <div>
      <h1>Candidates emotion analysis</h1>
      {emotions.map((emotionData, index) => (
        <div key={index}>
          <h4>Email: {emotionData.email}</h4>
          <div>
            <h3>Principle emotions :</h3>
            <ul>
              {emotionData.mainEmotions.map((emotion, index) => (
                <li key={index}>
                  {emotion.emotion}: {emotion.percentage}%
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Other emotions :</h3>
            <ul>
              {emotionData.otherEmotions.map((emotion, index) => (
                <li key={index}>
                  {emotion.emotion}: {emotion.percentage}%
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmotionList;
