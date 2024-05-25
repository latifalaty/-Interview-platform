import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const QuestionReponse = () => {
    const [questions, setQuestions] = useState([]);
    const [question, setQuestion] = useState('');
    const [reponse, setReponse] = useState('');
    const [domain, setDomain] = useState('');
    const [editingQuestionId, setEditingQuestionId] = useState(null);
    const [showForm, setShowForm] = useState(false); // État pour contrôler l'affichage du formulaire

    // Liste des domaines disponibles
    const domains = ['IT', 'Finance', 'Marketing', 'Engineering', 'Sales', 'HR'];

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const response = await axios.get('http://localhost:8009/questions');
            setQuestions(response.data);
        } catch (error) {
            console.error("Error fetching questions:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingQuestionId) {
            await axios.put(`http://localhost:8009/api/question/${editingQuestionId}`, { question, reponse, domain });
            setEditingQuestionId(null);
        } else {
            await axios.post('http://localhost:8009/createquestion', { question, reponse, domain });
        }
        setQuestion('');
        setReponse('');
        setDomain('');
        fetchQuestions();
    };

    const handleEdit = (question) => {
        setQuestion(question.question);
        setReponse(question.reponse);
        setDomain(question.domain);
        setEditingQuestionId(question._id);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            await axios.delete(`http://localhost:8009/api/question/${id}`);
            fetchQuestions();
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="my-4">Manage Questions and Answers</h1>
            {!showForm && ( // Affiche le bouton et le formulaire si showForm est false
                <button className="btn btn-primary mb-4" onClick={() => setShowForm(true)}>Add Question</button>
            )}
            {showForm && ( // Affiche le formulaire si showForm est true
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input type="text" className="form-control" placeholder="Question" value={question} onChange={(e) => setQuestion(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <textarea className="form-control" rows="3" placeholder="Answer" value={reponse} onChange={(e) => setReponse(e.target.value)}></textarea>
                    </div>
                    <div className="form-group">
                        <select className="form-control" value={domain} onChange={(e) => setDomain(e.target.value)}>
                            <option value="">Select Domain</option>
                            {domains.map((dom, index) => (
                                <option key={index} value={dom}>{dom}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary">{editingQuestionId ? 'Update Question' : 'Add Question'}</button>
                    <button className="btn btn-secondary ml-2" onClick={() => setShowForm(false)}>Cancel</button> {/* Bouton pour annuler l'ajout de question */}
                </form>
            )}
            <ul className="list-group mt-4">
                {questions.map(question => (
                    <li key={question._id} className="list-group-item">
                        <h3>{question.question}</h3>
                        <p>{question.reponse}</p>
                        <p><strong>Domain:</strong> {question.domain}</p>
                        <button onClick={() => handleEdit(question)} className="btn btn-primary mr-2">Edit</button>
                        <button onClick={() => handleDelete(question._id)} className="btn btn-danger">Delete</button>
                 
                    </li>
                ))}
            </ul>
            <Link to="/recruiter" className="btn btn-secondary mb-4">Back</Link> 
        </div>
    );
};

export default QuestionReponse;
