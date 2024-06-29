import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Offers = () => {
    const [offers, setOffers] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [salary, setSalary] = useState('');
    const [domain, setDomain] = useState('');
    const [editingOfferId, setEditingOfferId] = useState(null);
    const [showForm, setShowForm] = useState(false); // État pour contrôler l'affichage du formulaire

    // Liste des catégories disponibles
    const domains = ['IT', 'Finance', 'Marketing', 'Sales', 'HR'];

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            const response = await axios.get('http://localhost:8009/alloffers');
            setOffers(response.data);
        } catch (error) {
            console.error("Error fetching offers:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingOfferId) {
            await axios.put(`http://localhost:8009/api/offers/${editingOfferId}`, { title, description, salary, domain });
            setEditingOfferId(null);
        } else {
            await axios.post('http://localhost:8009/createoffer', { title, description, salary, domain });
        }
        setTitle('');
        setDescription('');
        setSalary('');
        setDomain('');
        fetchOffers();
    };

    const handleEdit = (offer) => {
        setTitle(offer.title);
        setDescription(offer.description);
        setSalary(offer.salary);
        setDomain(offer.domain);
        setEditingOfferId(offer._id);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this offer?')) {
            await axios.delete(`http://localhost:8009/api/offers/${id}`);
            fetchOffers();
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="my-4">Manage Offers</h1>
            {!showForm && ( // Affiche le bouton et le formulaire si showForm est false
                <button className="btn btn-primary mb-4" onClick={() => setShowForm(true)}>Add Offer</button>
            )}
            {showForm && ( // Affiche le formulaire si showForm est true
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input type="text" className="form-control" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <textarea className="form-control" rows="3" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                    </div>
                    <div className="form-group">
                        <input type="number" className="form-control" placeholder="Salary" value={salary} onChange={(e) => setSalary(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <select className="form-control" value={domain} onChange={(e) => setDomain(e.target.value)}>
                            <option value="">Select domain</option>
                            {domains.map((dom, index) => (
                                <option key={index} value={dom}>{dom}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary">{editingOfferId ? 'Update Offer' : 'Add Offer'}</button>
                    <button className="btn btn-secondary ml-2" onClick={() => setShowForm(false)}>Cancel</button> {/* Bouton pour annuler l'ajout d'offre */}
                </form>
            )}
            <ul className="list-group mt-4">
                {offers.map(offer => (
                    <li key={offer._id} className="list-group-item">
                        <h3>{offer.title}</h3>
                        <p>{offer.description}</p>
                        <p>Salary: ${offer.salary}</p>
                        <p>Domain: {offer.domain}</p>
                        <button onClick={() => handleEdit(offer)} className="btn btn-primary mr-2">Edit</button>
                        <button onClick={() => handleDelete(offer._id)} className="btn btn-danger">Delete</button>
                        
                    </li>
                ))}
            </ul>
            <Link to="/recruiter" className="btn btn-secondary mb-4">Back</Link> 
        </div>
    );
};

export default Offers;
