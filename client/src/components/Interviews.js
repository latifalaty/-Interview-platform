import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InterviewNotifications = () => {
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    // Fetch interviews from the server when the component mounts
    const fetchInterviews = async () => {
      try {
        const response = await axios.get('http://localhost:8009/interviews');
        setInterviews(response.data);
      } catch (error) {
        console.error('Error fetching interviews:', error);
      }
    };

    fetchInterviews();
  }, []); 

  return (
    <div>
      <h2>Interview Notifications</h2>
      {interviews.length === 0 ? (
        <p>No interviews scheduled</p>
      ) : (
        <ul>
          {interviews.map(interview => (
            <li key={interview._id}>
              <a href={interview.link} target="_blank" rel="noopener noreferrer">
                <strong>Date:</strong> {interview.date}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InterviewNotifications;
