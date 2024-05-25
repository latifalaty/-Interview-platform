import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './Offerslist.css';

const Offerslist = () => {
    const [offers, setOffers] = useState([]);
    const [fileInput, setFileInput] = useState(null);
    const userEmail = localStorage.getItem('usermail');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        axios.get('http://localhost:8009/offers')
            .then(response => {
                setOffers(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the offers!', error);
            });
    }, []);

    const handleFileChange = (e) => {
        setFileInput(e.target.files[0]);
    };

    const handleApply = async (offerId) => {
        if (!fileInput || !userEmail) {
            alert("Please sign in and upload a CV.");
            navigate('/login'); // Redirect to login page if user is not logged in
            return;
        }

        try {
            const formData = new FormData();
            formData.append('cv', fileInput);
            formData.append('email', userEmail);
            formData.append('offerId', offerId);

            await axios.post('http://localhost:8009/apply-for-job', formData);
            console.log("Application submitted successfully:", formData);

            setSuccessMessage('Application submitted successfully');
            setFileInput(null);

            // Clear success message after 5 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 5000);
        } catch (error) {
            console.error("Error applying for job:", error);
        }
    };

    return (
        <div className="offers-container">
            <h1 className="offers-title">Job Offers</h1>
            {successMessage && <div className="success-message">{successMessage}</div>}
            <ul>
                {offers.map(offer => (
                    <li key={offer._id} className="offer-card">
                        <h2 className="offer-title">{offer.title}</h2>
                        <p className="offer-description">{offer.description}</p>
                        <p className="offer-salary">Salary: {offer.salary}</p>
                        <p className="offer-domain">Domain: {offer.domain}</p>
                        <p>To apply, please upload your CV:</p>
                        <input
                            type="file"
                            className="form-control mb-2"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={handleFileChange}
                        />
                        <button
                            className="btn btn-primary"
                            onClick={() => handleApply(offer._id)}
                        >
                            Apply
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Offerslist;
