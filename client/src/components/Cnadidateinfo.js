import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EmailData = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8009/data-by-email');
        setData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const styles = {
    container: {
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    },
    emailSection: {
      border: '1px solid #ddd',
      padding: '20px',
      marginBottom: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
    },
    section: {
      marginBottom: '20px'
    },
    header: {
      textAlign: 'center',
      color: '#333'
    },
    emailHeader: {
      color: '#555'
    },
    subHeader: {
      color: '#666'
    },
    pre: {
      background: '#f4f4f4',
      padding: '10px',
      borderRadius: '4px',
      overflowX: 'auto'
    }
  };

  const parseExtractedText = (text) => {
    try {
      const parsed = JSON.parse(text);
      return parsed.extracted_text || text;
    } catch (error) {
      return text;
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Les données extraites de chaque candidat </h1>
      {Object.keys(data).map(email => (
        <div key={email} style={styles.emailSection}>
          <h2 style={styles.emailHeader}> Candidat qui correspond a l'email: {email}</h2>
          <div style={styles.section}>
            <h3 style={styles.subHeader}>Result of the Interview Analysis</h3>
            <div>
              <p><strong>ID:</strong> {data[email].candidateData._id}</p>
              <p><strong>Email:</strong> {data[email].candidateData.email}</p>
              <p><strong>Extracted Text:</strong> {parseExtractedText(data[email].candidateData.extractedText)}</p>
            </div>
          </div>
          <div style={styles.section}>
            <h3 style={styles.subHeader}>CV Analysis Data</h3>
            <div>
              <p><strong>ID:</strong> {data[email].cvAnalysis._id}</p>
              <p><strong>Applicant ID:</strong> {data[email].cvAnalysis.applicantId}</p>
              <p><strong>Email:</strong> {data[email].cvAnalysis.email}</p>
              <div>
                <h4>Extracted Text:</h4>
                {Object.keys(data[email].cvAnalysis.extractedText).map(key => (
                  <p key={key}><strong>{key}:</strong> {data[email].cvAnalysis.extractedText[key]}</p>
                ))}
              </div>
              <div>
                <h4>Extracted Faces Links:</h4>
                {data[email].cvAnalysis.extractedFacesLinks.map(link => (
                  <p key={link}><a href={link} target="_blank" rel="noopener noreferrer">{link}</a></p>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmailData;
