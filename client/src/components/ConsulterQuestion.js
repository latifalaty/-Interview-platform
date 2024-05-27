import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OfferQuestions = ({ domain }) => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(180); // Temps initial de 180 secondes (3 minutes)
    const [allQuestionsDisplayed, setAllQuestionsDisplayed] = useState(false);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await axios.get('http://localhost:8009/question');
                setQuestions(response.data);
                setCurrentQuestionIndex(0); // Réinitialiser l'index de la question lorsque les questions sont récupérées
                setAllQuestionsDisplayed(false); // Réinitialiser l'état des questions affichées
            } catch (error) {
                console.error("Error fetching questions:", error);
            }
        };

        fetchQuestions();
    }, [domain]);

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
    }, [currentQuestionIndex]);

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        } else {
            setAllQuestionsDisplayed(true);
        }
        setTimeLeft(180); // Réinitialiser le temps restant à 180 secondes (3 minutes) lors du passage à la question suivante
    };

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div>
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
