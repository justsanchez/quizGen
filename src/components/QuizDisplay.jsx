import React, { useState } from "react";
import "../styles/QuizDisplay.css";

export default function QuizDisplay({ response, selectedMode }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExplanations, setShowExplanations] = useState({});
  const [correctlyAnswered, setCorrectlyAnswered] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    const correctIndex = getCorrectAnswerIndex(response[questionIndex]);
    const isCorrect = optionIndex === correctIndex;

    // For testing mode, only store the last selected answer
    const newAnswers = selectedMode === 'testing' 
      ? [optionIndex]
      : [...(selectedAnswers[questionIndex] || []), optionIndex];

    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: newAnswers
    }));

    // Always show explanations in learning mode
    if (selectedMode === 'learning') {
      setShowExplanations(prev => ({ ...prev, [questionIndex]: true }));
    }
    
    if (isCorrect) {
      setCorrectlyAnswered(prev => ({ ...prev, [questionIndex]: true }));
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    // Show all explanations in testing mode after submit
    response.forEach((_, index) => {
      setShowExplanations(prev => ({ ...prev, [index]: true }));
    });
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
        const userAnswer = selectedAnswers[questionIndex]?.[0];
        const isCorrect = correctlyAnswered[questionIndex];
        const showExplanation = selectedMode === 'learning' 
          ? showExplanations[questionIndex]
          : submitted;

        return (
          <div key={questionIndex} className="quiz-question">
            <p className="question-text">
              <strong>Q{questionIndex + 1}: </strong> 
              {q.question}
              {selectedMode === 'testing' && submitted && (
                <span className={`result-tag ${isCorrect ? 'correct' : 'incorrect'}`}>
                </span>
              )}
            </p>

            <ul className="options-list">
              {q.options.map((option, optionIndex) => {
                const isSelected = selectedAnswers[questionIndex]?.includes(optionIndex);
                const isCorrectOption = optionIndex === correctAnswerIndex;
                const showAsCorrect = selectedMode === 'learning' ? isCorrectOption && isCorrect : submitted && isCorrectOption;
                const showAsIncorrect = selectedMode === 'learning' ? isSelected && !isCorrectOption : submitted && isSelected && !isCorrectOption;

                return (
                  <li
                    key={optionIndex}
                    className={`
                      option-item
                      ${selectedMode === 'testing' && isSelected ? 'selectedFinalAnswer' : ''}
                      ${showAsCorrect ? 'correct' : ''}
                      ${showAsIncorrect ? 'incorrect' : ''}
                      ${(selectedMode === 'testing' && submitted) ? 'disabled' : ''}
                    `}
                    onClick={() => {
                      if (selectedMode === 'testing' && submitted) return;
                      handleAnswerSelect(questionIndex, optionIndex);
                    }}
                  >
                    {option}
                  </li>
                );
              })}
            </ul>

            {(selectedMode === 'learning' && isCorrect) || (selectedMode === 'testing' && submitted) ? (
  <div className="explanation">
    <p><strong>Explanation:</strong> {q.explanation}</p>
    {selectedMode === 'learning' && (
      <div className="feedback">
        <span className="correct-badge">You got it right!</span>
      </div>
    )}
  </div>
) : null}

            
          </div>
        );
      })}

{selectedMode === 'testing' && !submitted && (
        <div className="submit-section">
          <button 
            className="submit-button"
            onClick={handleSubmit}
            style={{ backgroundColor: '#2196f3' }}
          >
            Submit Quiz
          </button>
        </div>
      )}
    </div>
  );
}