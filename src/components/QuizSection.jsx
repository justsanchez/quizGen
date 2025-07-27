// separated quiz section from AIQuizNotes.jsx due to being too large 
import React, { useState, useEffect } from "react";
import { shuffleArray, shuffleQuestionOptions } from "../helper/quizHelper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import ScrollToTop from "./ScrollToTop";
import "../styles/QuizSection.css";


export default function QuizSection({ response }) {
  // console.log('response: ', JSON.stringify(response, null, 2));
  const [processedQuestions, setProcessedQuestions] = useState(response);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExplanations, setShowExplanations] = useState({});
  const [correctlyAnswered, setCorrectlyAnswered] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [mode, setSelectedMode] = useState("learning");

  // shuffle the answers on load
  // useEffect(() => {
  //   if (response && !hasInitialized.current) {
  //     const shuffledQuestions = response.map(shuffleQuestionOptions);
  //     setProcessedQuestions(shuffledQuestions);
  //   }
  // }, [response]);

  /**
   * Handles the logic when a user selects an answer option for a given question.
   *
   * - In "testing" mode: stores only the most recent selected option.
   * - In "learning" mode: stores multiple selected options and shows explanation.
   * - Updates the correct answer state if the selection is correct.
   *
   * @param {number} questionIndex - The index of the question being answered.
   * @param {number} optionIndex - The index of the selected answer option.
   */
  const handleAnswerSelect = (questionIndex, optionIndex) => {
    const question = processedQuestions[questionIndex];
    if (!question) return;

    const isCorrect = optionIndex === question.correct;
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
    processedQuestions.forEach((_, index) => {
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
  
  // Shuffles the entire quiz: questions and their options
  const shuffleQuiz = () => {
    const shuffledQuestions = shuffleArray(processedQuestions).map(shuffleQuestionOptions);
    resetQuizStates();
    setProcessedQuestions(shuffledQuestions);
  };


  return (
    <div
      className="quiz-container"
      style={{
        boxShadow:
          mode === "testing"
            ? "0 2px 13px rgba(30, 144, 255, 0.3)" // soft Dodger Blue shadow
            : "0 2px 13px rgba(144, 238, 144, 0.3)", // soft LightGreen shadow
      }}
    >
      {/* add a shuffle question button */}
  {/* Shuffle Button */}
  <button
    onClick={shuffleQuiz}
    className="text-sm px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
  >
    Shuffle Q&A
  </button>

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

      {processedQuestions.map((q, questionIndex) => {
        // ! this is not scalable, can you just get the correct answer index from the q object?
        const correctAnswerIndex = q.correct;
        const isCorrect = correctlyAnswered[questionIndex];

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
                      ${showAsIncorrect ? "incorrect disabled" : ""}
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
              {/* !only for testing while developing */}
              {/* <p>Correct Answer: {q.options[q.correct]}</p> */}
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
        <div>
          <div className="submit-section">
            <button
                className="submit-button"
              onClick={() => {
                window.scrollTo(0, 0);
                resetQuizStates();
                setProcessedQuestions(response.map(shuffleQuestionOptions));
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