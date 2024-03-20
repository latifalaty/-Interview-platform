import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OffersByCategory = () => {
    const [offers, setOffers] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [fileInput, setFileInput] = useState(null);
    const categories = ['IT', 'Finance', 'Marketing', 'Engineering', 'Sales', 'HR'];
    const userEmail = localStorage.getItem('usermail'); // Récupérez l'e-mail stocké dans le local storage

    useEffect(() => {
        if (selectedCategory) {
            fetchOffersByCategory(selectedCategory);
        }
    }, [selectedCategory]);

    const fetchOffersByCategory = async (category) => {
        try {
            const response = await axios.get(`http://localhost:8009/offers/${category}`);
            setOffers(response.data);
        } catch (error) {
            console.error("Error fetching offers by category:", error);
        }
    };

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
    };

    const handleFileChange = (e) => {
        setFileInput(e.target.files[0]);
    };

    const handleApply = async (offerId) => {
        try {
            const formData = new FormData();
            formData.append('cv', fileInput);
            formData.append('email', userEmail); // Ajoutez l'e-mail récupéré du local storage au formulaire de données
            formData.append('offerId', offerId); // Ajoutez l'ID de l'offre au formulaire de données

            await axios.post(`http://localhost:8009/apply-for-job`, formData);
            console.log("Application submitted successfully:", formData);

            // Réinitialiser le champ d'entrée de fichier après avoir soumis la candidature
            setFileInput(null);
        } catch (error) {
            console.error("Error applying for job:", error);
        }
    };

    return (
        <div>
            <h2>Choose a Category</h2>
            <select value={selectedCategory} onChange={handleCategoryChange}>
                <option value="">Select Category</option>
                {categories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                ))}
            </select>
            {selectedCategory && (
                <>
                    <h2>Offers in {selectedCategory}</h2>
                    <ul>
                        {offers.map(offer => (
                            <li key={offer._id}>
                                <h3>{offer.title}</h3>
                                <p>{offer.description}</p>
                                <p>Salary: ${offer.salary}</p>
                                <p>Category: {offer.category}</p>
                                <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} />
                                <button onClick={() => handleApply(offer._id)}>Apply</button>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};

export default OffersByCategory;
