import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OffersByDomain = () => {
    const [offers, setOffers] = useState([]);
    const [selectedDomain, setSelectedDomain] = useState('');
    const [fileInput, setFileInput] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const domains = ['IT', 'Finance', 'Marketing', 'Engineering', 'Sales', 'HR'];
    const userEmail = localStorage.getItem('usermail');

    useEffect(() => {
        if (selectedDomain) {
            fetchOffersByDomain(selectedDomain);
        }
    }, [selectedDomain]);

    const fetchOffersByDomain = async (domain) => {
        try {
            const response = await axios.get(`http://localhost:8009/offers/${domain}`);
            setOffers(response.data);
        } catch (error) {
            console.error("Error fetching offers by domain:", error);
        }
    };

    const handleDomainChange = (e) => {
        setSelectedDomain(e.target.value);
    };

    const handleFileChange = (e) => {
        setFileInput(e.target.files[0]);
    };

    const handleApply = async (offerId) => {
        try {
            const formData = new FormData();
            formData.append('cv', fileInput);
            formData.append('email', userEmail);
            formData.append('offerId', offerId);

            await axios.post(`http://localhost:8009/apply-for-job`, formData);
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
        <div className="container">
            <h1>Offers</h1>
            <h2>Choose a domain</h2>
            <select className="form-select mb-3" value={selectedDomain} onChange={handleDomainChange}>
                <option value="">Select domain</option>
                {domains.map((domain, index) => (
                    <option key={index} value={domain}>{domain}</option>
                ))}
            </select>
            {selectedDomain && (
                <>
                    <h2>Offers in {selectedDomain}</h2>
                    <ul className="list-group">
                        {offers.map(offer => (
                            <li key={offer._id} className="list-group-item">
                                <h3>{offer.title}</h3>
                                <p>{offer.description}</p>
                                <p>Salary: {offer.salary} D</p>
                                <p>Domain: {offer.domain}</p>
                                <p>To apply send your CV here :</p>
                                <input type="file" className="form-control mb-2" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} />
                                <button className="btn btn-primary" onClick={() => handleApply(offer._id)}>Apply</button>
                            </li>
                        ))}
                    </ul>
                    {successMessage && (
                        <div className="alert alert-success mt-3" role="alert">
                            {successMessage}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default OffersByDomain;
