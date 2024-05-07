import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CandidateDataComponent = () => {
    const [candidateData, setCandidateData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8009/candidateData');
                setCandidateData(response.data);
            } catch (error) {
                console.error('Erreur lors de la récupération des données des candidats analysées : ', error);
            }
        };
        fetchData();
    }, []);

    return (
        <div>
            <h1>Données des candidats analysées</h1>
            <ul>
                {candidateData.map(candidate => (
                    <li key={candidate._id}>
                        <p>Email: {candidate.email}</p>
                        <p>Extracted Text: {candidate.extractedText}</p>
                    
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CandidateDataComponent;
