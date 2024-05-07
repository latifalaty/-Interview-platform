import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CvAnalysisComponent = () => {
    const [cvAnalysisData, setCvAnalysisData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8009/cvAnalysis');
                setCvAnalysisData(response.data);
            } catch (error) {
                console.error('Erreur lors de la récupération des données d\'analyse des CV : ', error);
            }
        };
        fetchData();
    }, []);

    return (
        <div>
            <h1>Données d'analyse des CV</h1>
            <ul>
                {cvAnalysisData.map(cv => (
                    <li key={cv._id}>
                        <p>Applicant ID: {cv.applicantId}</p>
                        <p>Email: {cv.email}</p>
                        <p>Extracted Text: {JSON.stringify(cv.extractedText)}</p>
                        <p>Extracted Faces Links: {cv.extractedFacesLinks.join(', ')}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CvAnalysisComponent;
