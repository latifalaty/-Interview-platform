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
      <h1 style={styles.header}>Les données extraites de chaque candidat après l'entretien</h1>
      {Object.keys(data).map(email => (
        <div key={email} style={styles.emailSection}>
          <h2 style={styles.emailHeader}>Candidat qui correspond à l'email: {email}</h2>
          <div style={styles.section}>
            <h3 style={styles.subHeader}>Résultat de l'analyse de l'entretien</h3>
            <div>
              <p><strong>Texte extrait:</strong> {data[email].candidateData && data[email].candidateData.extractedText ? parseExtractedText(data[email].candidateData.extractedText) : 'N/A'}</p>
            </div>
          </div>
          <div style={styles.section}>
            <h3 style={styles.subHeader}>Données d'analyse du CV</h3>
            <div>
                <p><strong>Email:</strong> {data[email].cvAnalysis && data[email].cvAnalysis.email ? data[email].cvAnalysis.email : 'N/A'}</p>
              <div>
                <h4>Texte extrait:</h4>
                {data[email].cvAnalysis && data[email].cvAnalysis.extractedText &&
                  Object.keys(data[email].cvAnalysis.extractedText).map(key => (
                    <p key={key}><strong>{key}:</strong> {data[email].cvAnalysis.extractedText[key]}</p>
                  ))}
              </div>
              <div>
                <h4>Liens des visages extraits:</h4>
                {data[email].cvAnalysis && data[email].cvAnalysis.extractedFacesLinks &&
                  data[email].cvAnalysis.extractedFacesLinks.map(link => (
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
