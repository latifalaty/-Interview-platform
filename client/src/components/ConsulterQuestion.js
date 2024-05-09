import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OfferQuestions = () => {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(180); // Temps initial de 180 secondes (3 minutes)
    const [allQuestionsDisplayed, setAllQuestionsDisplayed] = useState(false);
    const [displayedQuestionIndices, setDisplayedQuestionIndices] = useState(new Set());
    const categories = ['IT', 'Finance', 'Marketing', 'Engineering', 'Sales', 'HR'];

    useEffect(() => {
        const fetchQuestions = async () => {
            if (selectedCategory) {
                try {
                    const response = await axios.get(`http://localhost:8009/questions/${selectedCategory}`);
                    setQuestions(response.data);
                    setCurrentQuestionIndex(0); // Réinitialiser l'index de la question lorsque la catégorie est changée
                    setAllQuestionsDisplayed(false); // Réinitialiser l'état des questions affichées
                    setDisplayedQuestionIndices(new Set()); // Réinitialiser l'ensemble des indices des questions affichées
                } catch (error) {
                    console.error("Error fetching questions:", error);
                }
            }
        };

        fetchQuestions();
    }, [selectedCategory]);

    useEffect(() => {
        if (questions.length > 0 && displayedQuestionIndices.size === 0) {
            setDisplayedQuestionIndices(new Set([0])); // Ajouter le premier index au set des indices des questions affichées
        }
    }, [questions, displayedQuestionIndices]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime > 0) {
                    return prevTime - 1;
                } else {
                    handleNextQuestion();
                    return 180; // Réinitialiser le temps restant à 180 secondes (3 minutes)
                }
            });
        }, 1000); // Mettre à jour le temps restant toutes les secondes

        // Arrêter le timer lorsque toutes les questions ont été affichées
        return () => {
            clearInterval(timer);
        };
    }, [currentQuestionIndex, questions, displayedQuestionIndices]);

    const handleNextQuestion = () => {
        if (displayedQuestionIndices.size < questions.length) {
            let nextIndex;
            do {
                nextIndex = Math.floor(Math.random() * questions.length);
            } while (displayedQuestionIndices.has(nextIndex)); // Trouver un index qui n'a pas encore été affiché
            setCurrentQuestionIndex(nextIndex);
            setDisplayedQuestionIndices(new Set(displayedQuestionIndices).add(nextIndex)); // Ajouter le nouvel index au set des indices des questions affichées
        } else {
            setAllQuestionsDisplayed(true);
        }
        setTimeLeft(180); // Réinitialiser le temps restant à 180 secondes (3 minutes) lors du passage à la question suivante
    };

    const handleChangeCategory = (e) => {
        setSelectedCategory(e.target.value);
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
                    {!allQuestionsDisplayed && <button onClick={handleNextQuestion} className='btn danger'>Next</button>}
                </div>
            )}
            {allQuestionsDisplayed && <p>Vous êtes arrivé à la fin des questions.</p>}
        </div>
    );
};

export default OfferQuestions;
