import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const CreateTechnicalForm = () => {
    const [domain, setDomain] = useState('');
    const [problem, setProblem] = useState('');
    const [solution, setSolution] = useState('');

    // List of available domains
    const domains = ['IT', 'Finance', 'Marketing', 'Engineering', 'Sales', 'HR'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.post('http://localhost:8009/createTechnicalItem', { domain, problem, solution });
        setDomain('');
        setProblem('');
        setSolution('');
    };

    return (
        <div className="container mt-5">
            <h1 className="my-4">Create Technical test</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <select className="form-control" value={domain} onChange={(e) => setDomain(e.target.value)}>
                        <option value="">Select Domain</option>
                        {domains.map((dom, index) => (
                            <option key={index} value={dom}>{dom}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <textarea className="form-control" rows="3" placeholder="Problem" value={problem} onChange={(e) => setProblem(e.target.value)}></textarea>
                </div>
                <div className="form-group">
                    <textarea className="form-control" rows="3" placeholder="Solution" value={solution} onChange={(e) => setSolution(e.target.value)}></textarea>
                </div>
                <button type="submit" className="btn btn-primary">Create Technical test</button>
            </form>
            <Link to="/recruiter" className="btn btn-secondary mt-3">Back</Link>
        </div>
    );
};

export default CreateTechnicalForm;
