// This fill is heavy with a mix of TailwindCSS and custom CSS.
// Todo: I need to clean up the CSS to be pure TailwindCSS

import React, { useState } from "react";
import "../styles/QuizSection.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import ScrollToTop from "./ScrollToTop";

export default function QuizDisplay({ response }) {
  console.log('response LOOK AT MEEE: ', JSON.stringify(response, null, 2));
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExplanations, setShowExplanations] = useState({});
  const [correctlyAnswered, setCorrectlyAnswered] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const [mode, setSelectedMode] = useState("learning");

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    const correctIndex = response[questionIndex].correct;
    const isCorrect = optionIndex === correctIndex;
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
            className="text-gray-200 cursor-pointer text-sm opacity-80 hover:opacity-100 transition-opacity"
          />
          <div className="bg-white absolute bottom-full mb-2 hidden w-48 text-xs text-black p-2 rounded-lg shadow-lg group-hover:block">
            Switching Modes will clear all progress on current mode.
          </div>
        </div>

        {/* Mode Label (Fixed Width) */}
        <span className=" text-sm font-medium text-gray-300 w-[110px] text-center">
          {mode === "learning" ? "Learning Mode" : "Testing Mode"}
        </span>

        {/* Toggle Switch */}
        <div
          className="relative inline-flex h-6 w-12 cursor-pointer rounded-full bg-gray-300"
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
      </div>

      <h2 className="quizPage-title text-gray-300">Generated Quiz:</h2>

      {response.map((q, questionIndex) => {
        // ! this is not scalable, can you just get the correct answer index from the q object?
        const correctAnswerIndex = q.correct;
        console.log('correctAnswerIndex LOOK AT MEEE: ', correctAnswerIndex);
        const isCorrect = correctlyAnswered[questionIndex];
        console.log('isCorrect LOOK AT MEEE: ', isCorrect);

        return (
          <div key={questionIndex} className="quiz-question text-gray-300">
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

            <ul className="options-list ">
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
                    className={`option-item 
                      ${
                        mode === "testing" && isSelected ? "selectedAnswer" : ""
                      }
                      ${showAsCorrect ? "correct" : ""}
                      ${showAsIncorrect ? "incorrect" : ""}
                      ${mode === "testing" && submitted ? "disabled" : ""}
                      ${
                        mode === "learning" && correctlyAnswered[questionIndex]
                          ? "disabled"
                          : ""
                      }

                      
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
      {mode === "testing" && submitted && (
        // ! Not fully tested
        <div>
          <div className="submit-section">
            <button
              className="submit-button"
              onClick={() => {
                resetQuizStates();
                ScrollToTop();
              }}
              style={{ backgroundColor: "#2196f3" }}
            >
              Reset Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}