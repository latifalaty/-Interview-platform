import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './classifier.css'; // Import the CSS file

const CVVideoClassifier = () => {
  const [classifiedPairs, setClassifiedPairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClassifiedPairs = async () => {
      try {
        const response = await axios.get('http://localhost:8009/classify');
        setClassifiedPairs(response.data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchClassifiedPairs();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching data: {error.message}</p>;

  return (
    <div>
      <h1>Classified Candidate</h1>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Email Candidat</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {classifiedPairs.map((pair, index) => (
            <tr key={`${pair.cv_id}-${pair.video_id}`}>
              <td>{index + 1}</td>
              <td>{pair.cv_email}</td>
              <td>{pair.similarity.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CVVideoClassifier;
