import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ApplicantsList = () => {
  const [applicants, setApplicants] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await axios.get('http://localhost:8009/applicants');
        setApplicants(result.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();
  }, []);

  return (
    <div>
      <h1>Liste des Candidats</h1>
      <ul>
        {applicants.map(applicant => (
          <li key={applicant._id}>
            <strong>Email :</strong> {applicant.email}
            <br />
            <strong>Offre d'emploi ID :</strong> {applicant.offerId}
            <br />
            <div>
            <strong>CV :</strong>
            <iframe title="CV" src={applicant.cv} width="100%" height="600px"></iframe>
          </div>

          </li>
        ))}
      </ul>
    </div>
  );
};

export default ApplicantsList;
