import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ApplicantAnalysis = () => {
    const [analysisResults, setAnalysisResults] = useState([]);

    useEffect(() => {
        const fetchAnalysisResults = async () => {
            try {
                const response = await axios.get('http://localhost:8009/analyze-applicants');
                setAnalysisResults(response.data.data);
            } catch (error) {
                console.error('Error fetching analysis results:', error);
            }
        };

        fetchAnalysisResults();
    }, []);

    return (
        <div>
            <h1>Analysis Results</h1>
            <ul>
                {analysisResults.map((result, index) => (
                    <li key={index}>
                        <h2>Applicant ID: {result.applicantId}</h2>
                        <h3>Extracted Text:</h3>
                        {Object.entries(result.extractedText).map(([sectionTitle, sectionText], sectionIndex) => (
                            <div key={sectionIndex}>
                                <h4>{sectionTitle}</h4>
                                <pre>{sectionText}</pre>
                            </div>
                        ))}
                        <h3>Extracted Faces:</h3>
                        <ul>
                            {result.extractedFaces.map((face, faceIndex) => (
                                <li key={faceIndex}>
                                    <img src={face} alt={`Face ${faceIndex}`} />
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ApplicantAnalysis;
