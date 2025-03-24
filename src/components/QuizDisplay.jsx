import React, { useState } from "react";
import "../styles/QuizDisplay.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";

export default function QuizDisplay({ response, selectedMode }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExplanations, setShowExplanations] = useState({});
  const [correctlyAnswered, setCorrectlyAnswered] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const [mode, setSelectedMode] = useState(selectedMode);

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    const correctIndex = getCorrectAnswerIndex(response[questionIndex]);
    const isCorrect = optionIndex === correctIndex;

    // For testing mode, only store the last selected answer
    const newAnswers =
      mode === "testing"
        ? [optionIndex]
        : [...(selectedAnswers[questionIndex] || []), optionIndex];

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: newAnswers,
    }));

    if (mode === "learning") {
      setShowExplanations((prev) => ({ ...prev, [questionIndex]: true }));
    }

    if (isCorrect) {
      setCorrectlyAnswered((prev) => ({ ...prev, [questionIndex]: true }));
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    // Show all explanations in testing mode after submit
    response.forEach((_, index) => {
      setShowExplanations((prev) => ({ ...prev, [index]: true }));
    });
  };

  const getCorrectAnswerIndex = (question) => {
    return question.options.findIndex((option) => {
      const optionLetter = option.split(".")[0].trim().toUpperCase();
      return optionLetter === question.correct.toUpperCase();
    });
  };

  const resetQuizStates = () => {
    setSelectedAnswers({});
    setShowExplanations({});
    setCorrectlyAnswered({});
    setSubmitted(false);
  };

  const toggleMode = () => {
    resetQuizStates();
    setSelectedMode((prevMode) =>
      prevMode === "learning" ? "testing" : "learning"
    );
  };

  return (
    <div className="quiz-container">
      <div className="flex items-center justify-end relative">
        {/* Helper Icon with Tooltip */}
        <div className="group relative flex items-center mr-2">
          <FontAwesomeIcon
            icon={faCircleInfo}
            className="text-gray-400 cursor-pointer text-sm opacity-80 hover:opacity-100 transition-opacity"
          />
          <div className="absolute bottom-full mb-2 hidden w-48 text-xs text-white bg-gray-800 p-2 rounded-lg shadow-lg group-hover:block">
            Switching Modes will clear all progress on current mode.
          </div>
        </div>

        {/* Toggle Switch */}
        <div
          className="relative inline-flex h-6 w-12 cursor-pointer rounded-full bg-gray-200"
          onClick={toggleMode}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full transition ${
              mode === "testing"
                ? "translate-x-6 bg-blue-500"
                : "translate-x-0 bg-green-500"
            }`}
          />
        </div>

        {/* Mode Label (Fixed Width) */}
        <span className=" text-sm font-medium text-gray-700 w-[110px] text-center">
          {mode === "learning" ? "Learning Mode" : "Testing Mode"}
        </span>
      </div>

      <h2 className="homepage-title">Generated Quiz:</h2>

      {response.map((q, questionIndex) => {
        const correctAnswerIndex = getCorrectAnswerIndex(q);
        const isCorrect = correctlyAnswered[questionIndex];

        return (
          <div key={questionIndex} className="quiz-question">
            <p className="question-text">
              <strong>Q{questionIndex + 1}: </strong>
              {q.question}
              {mode === "testing" && submitted && (
                <span
                  className={`result-tag ${
                    isCorrect ? "correct" : "incorrect"
                  }`}
                ></span>
              )}
            </p>

            <ul className="options-list">
              {q.options.map((option, optionIndex) => {
                const isSelected =
                  selectedAnswers[questionIndex]?.includes(optionIndex);
                const isCorrectOption = optionIndex === correctAnswerIndex;
                const showAsCorrect =
                  mode === "learning"
                    ? isCorrectOption && isCorrect
                    : submitted && isCorrectOption;
                const showAsIncorrect =
                  mode === "learning"
                    ? isSelected && !isCorrectOption
                    : submitted && isSelected && !isCorrectOption;

                return (
                  <li
                    key={optionIndex}
                    className={`
                      option-item
                      ${
                        mode === "testing" && isSelected ? "selectedAnswer" : ""
                      }
                      ${showAsCorrect ? "correct" : ""}
                      ${showAsIncorrect ? "incorrect" : ""}
                      ${mode === "testing" && submitted ? "disabled" : ""}
                    `}
                    onClick={() => {
                      if (
                        (mode === "testing" && submitted) ||
                        (mode === "learning" &&
                          correctlyAnswered[questionIndex])
                      )
                        return;
                      handleAnswerSelect(questionIndex, optionIndex);
                    }}
                  >
                    {option}
                  </li>
                );
              })}
            </ul>

            {(mode === "learning" && isCorrect) ||
            (mode === "testing" && submitted) ? (
              <div className="explanation">
                {mode === "learning" && (
                  <div className="py-1 text-green-600 font-bold">
                    <span>You got it right!</span>
                  </div>
                )}
                <p>
                  <strong>Explanation:</strong> {q.explanation}
                </p>
              </div>
            ) : null}

          
          </div>
        );
      })}

      {mode === "testing" && !submitted && (
        <div className="submit-section">
          <button
            className="submit-button"
            onClick={handleSubmit}
            style={{ backgroundColor: "#2196f3" }}
          >
            Submit Quiz
          </button>
        </div>
      )}
    </div>
  );
}
