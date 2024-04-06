import React, { useState } from 'react';
import axios from 'axios';

const Analyse = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [candidateEmail, setCandidateEmail] = useState('');

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleEmailChange = (event) => {
        setCandidateEmail(event.target.value);
    };

    const handleUpload = async () => {
        if (!selectedFile || !candidateEmail) {
            console.error('Please select a file and enter your email.');
            return;
        }

        const formData = new FormData();
        formData.append('video', selectedFile);
        formData.append('email', candidateEmail);

        try {
            const response = await axios.post('http://localhost:8009/analyse', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('File uploaded successfully');
            console.log('Extracted Text:', response.data);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            <input type="email" placeholder="Enter your email" value={candidateEmail} onChange={handleEmailChange} />
            <button onClick={handleUpload}>Upload</button>
        </div>
    );
};

export default Analyse;
