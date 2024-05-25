import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Offerslist.css'; // Import du fichier CSS

const ApplicantsList = () => {
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewLink, setInterviewLink] = useState('');
  const [roomNumber, setRoomNumber] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await axios.get('http://127.0.0.1:8009/applicants');
        setApplicants(result.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();
  }, []);

  const handleScheduleInterview = async () => {
    if (!selectedApplicant || !interviewDate || !interviewLink || !roomNumber) {
      console.error('Please select an applicant and provide interview details');
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8009/schedule', {
        email: selectedApplicant.email,
        date: interviewDate,
        link: interviewLink,
        domain: selectedApplicant.offerId.domain,
        roomnumber: roomNumber // Ajout du numéro de salle
      });
      console.log(response.data.message);
    } catch (error) {
      console.error('Failed to schedule interview:', error);
    }
  };

  return (
    <div className="container">
      <h1>Liste des Candidats</h1>
      <ul className="applicants-list">
        {applicants.map(applicant => (
          <li key={applicant._id} className="applicant-item">
            <div className="applicant-details">
              <strong>Email :</strong> {applicant.email}
              <br />
              <strong>Domaine de l'offre :</strong> {applicant.offerId ? applicant.offerId.domain : 'N/A'}
            </div>
            <div className="cv-container">
              <strong>CV :</strong>
              <iframe title="CV" src={applicant.cv} className="cv-iframe"></iframe>
            </div>
            <button onClick={() => setSelectedApplicant(applicant)} style={{ backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: '5px' }}>Planifier une interview</button>
          </li>
        ))}
      </ul>
      
      {selectedApplicant && (
        <div className="interview-form">
          <h2>Planifier une entrevue pour {selectedApplicant.email}</h2>
          <label>Date de l'entrevue:</label>
          <input type="date" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} />
          <br />
          <label>Lien de l'entrevue:</label>
          <input type="text" value={interviewLink} onChange={(e) => setInterviewLink(e.target.value)} />
          <br />
          <label>Numéro de salle:</label> {/* Champ pour le numéro de salle */}
          <input type="text" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} />
          <br />
          <button onClick={handleScheduleInterview}>Planifier</button>
        </div>
      )}
    </div>
  );
};

export default ApplicantsList;
