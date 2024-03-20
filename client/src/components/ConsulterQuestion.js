import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OfferQuestions = () => {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30); // Temps initial de 30 secondes
    const [allQuestionsDisplayed, setAllQuestionsDisplayed] = useState(false);
    const categories = ['IT', 'Finance', 'Marketing', 'Engineering', 'Sales', 'HR'];

    useEffect(() => {
        const fetchQuestions = async () => {
            if (selectedCategory) {
                try {
                    const response = await axios.get(`http://localhost:8009/questions/${selectedCategory}`);
                    setQuestions(response.data);
                } catch (error) {
                    console.error("Error fetching questions:", error);
                }
            }
        };

        fetchQuestions();
    }, [selectedCategory]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime > 0) {
                    return prevTime - 1;
                } else {
                    // Passer à la question suivante lorsque le temps est écoulé
                    setCurrentQuestionIndex(prevIndex => {
                        const nextIndex = (prevIndex + 1) % questions.length;
                        if (nextIndex === 0) {
                            setAllQuestionsDisplayed(true);
                        }
                        return nextIndex;
                    });
                    return 30; // Réinitialiser le temps restant à 30 secondes
                }
            });
        }, 1000); // Mettre à jour le temps restant toutes les secondes

        // Arrêter le timer lorsque toutes les questions ont été affichées
        return () => {
            clearInterval(timer);
        };
    }, [currentQuestionIndex, questions]);

    const handleChangeCategory = (e) => {
        setSelectedCategory(e.target.value);
        setCurrentQuestionIndex(0); // Réinitialiser l'index de la question lorsqu'une nouvelle catégorie est sélectionnée
        setAllQuestionsDisplayed(false); // Réinitialiser l'état des questions affichées
    };

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div>
            <h2>Select Category:</h2>
            <select value={selectedCategory} onChange={handleChangeCategory}>
                <option value="">-- Select Category --</option>
                {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                ))}
            </select>
            {currentQuestion && !allQuestionsDisplayed && (
                <div>
                    <h2>Question:</h2>
                    <h3>{currentQuestion.question}</h3>
                    <p>Time Left: {timeLeft} seconds</p>
                </div>
            )}
            {allQuestionsDisplayed && <p>Vous êtes arrivé à la fin des questions.</p>}
        </div>
    );
};

export default OfferQuestions;
