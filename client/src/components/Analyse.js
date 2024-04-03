import React, { useState } from 'react';
import axios from 'axios';

const Analyse = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      console.error('Please select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('video', selectedFile);

    try {
      const response = await axios.post('http://localhost:8009/analyse', formData, {
        headers: {
          'Content-Type': 'multipart/form-data' // Ensure correct content type for file upload
        }
      });

      console.log('File uploaded successfully');
      console.log('Extracted Text:', response.data);
      
      // Download the extracted text as a file
      const element = document.createElement("a");
      const file = new Blob([response.data], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = "extracted_text.txt";
      document.body.appendChild(element);
      element.click();
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default Analyse;
