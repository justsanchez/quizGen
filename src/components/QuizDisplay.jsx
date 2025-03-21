import React, { useState } from "react";
import "../styles/QuizDisplay.css";

export default function QuizDisplay({ response, selectedMode }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExplanations, setShowExplanations] = useState({});
  const [correctlyAnswered, setCorrectlyAnswered] = useState({});

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    const correctIndex = getCorrectAnswerIndex(response[questionIndex]);
    const isCorrect = optionIndex === correctIndex;

    setSelectedAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
    setShowExplanations(prev => ({ ...prev, [questionIndex]: true }));
    
    if (isCorrect) {
      setCorrectlyAnswered(prev => ({ ...prev, [questionIndex]: true }));
    }
  };

  const getCorrectAnswerIndex = (question) => {
    return question.options.findIndex(option => {
      const optionLetter = option.split('.')[0].trim().toUpperCase();
      return optionLetter === question.correct.toUpperCase();
    });
  };

  return (
    <div className="quiz-container">
      <h2 className="homepage-title">Generated Quiz:</h2>
      {response.map((q, questionIndex) => {
        const correctAnswerIndex = getCorrectAnswerIndex(q);
        const hasAnswered = showExplanations[questionIndex];
        const isCorrect = correctlyAnswered[questionIndex];

        return (
          <div key={questionIndex} className="quiz-question">
            <p className="question-text">
              <strong>Q{questionIndex + 1}: </strong> 
              {q.question}
            </p>
            
            <ul className="options-list">
              {q.options.map((option, optionIndex) => {
                const isSelected = selectedAnswers[questionIndex] === optionIndex;
                const isCorrectOption = optionIndex === correctAnswerIndex;
                const showResult = hasAnswered && (isCorrect || isSelected);

                return (
                  <li
                    key={optionIndex}
                    className={`
                      option-item 
                      ${isSelected ? 'selected' : ''}
                      ${showResult ? (isCorrectOption ? 'correct' : 'incorrect') : ''}
                      ${isCorrect ? 'disabled' : ''}
                    `}
                    onClick={!isCorrect ? () => handleAnswerSelect(questionIndex, optionIndex) : undefined}
                  >
                    {option}
                    {showResult && isCorrectOption && (
                      <span className="correct-marker"> ✓</span>
                    )}
                  </li>
                );
              })}
            </ul>

            {isCorrect && (
            showExplanations[questionIndex] && (
              <div className="explanation">
                <p><strong>Explanation:</strong> {q.explanation}</p>
                <div className="feedback">
                    <span className="correct-badge">You got it right!</span>
                </div>
              </div>
            )
                  )}


          </div>
        );
      })}
    </div>
  );
}