import React, { useState } from 'react';
import axios from 'axios';

const InterviewForm = () => {
  const [date, setDate] = useState('');
  const [link, setLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8009/schedule', { date, link });
      alert('Interview scheduled successfully!');
      setDate('');
      setLink('');
    } catch (error) {
      console.error(error);
      alert('Failed to schedule interview');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Date:</label>
      <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
      <label>Link:</label>
      <input type="text" value={link} onChange={(e) => setLink(e.target.value)} required />
      <button type="submit">Schedule Interview</button>
    </form>
  );
};

export default InterviewForm;