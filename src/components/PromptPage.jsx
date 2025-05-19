import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AIQuizNotes.css";
import { useDevelopingFlag } from "../contexts/DevelopingFlag";

export default function PromptSection() {
  const [input, setInput] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState(10);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState("deepseek-chat");
  const navigate = useNavigate();
  // ! this allows us not to exhausted the API calls
  const { isDeveloping } = useDevelopingFlag();

  const modelOptions = [
    {
      id: "deepseek-chat",
      name: "DeepSeek Chat",
      description:
        "General-purpose AI model optimized for broad knowledge tasks.",
    },
    {
      id: "deepseek-reasoner",
      name: "DeepSeek Reasoner",
      description:
        "Specialized model focused on logical reasoning and technical domains.",
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const wordCount = input.trim().split(/\s+/).length;
    if (wordCount < 20 && !isDeveloping) {
      setErrorMessage("Please enter at least 20 words to generate a quiz.");
      console.log("errorMessage:", errorMessage);
      return;
    }
    // Proceed with quiz generation logic...
    if (!input.trim()) return;
    setErrorMessage(""); // Clear message if valid

    // Navigate to quiz page with state
    navigate("/quizNotes", {
      state: {
        transcript: input,
        model: selectedModel,
        difficulty: difficulty,
        numQuestions: numQuestions,
      },
    });
  };

  return (
    <div className="quizPage-container">
      <h2 className="quizPage-title text-gray-100 pt-10">AI Quiz Generator</h2>

      <form onSubmit={handleSubmit} className="quizPage-form border-none">
        <div className="form-group text-gray-100">
          <label htmlFor="model">Select Model:</label>
          <div className="grid gap-3">
            {modelOptions.map((model) => (
              <div
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedModel === model.id
                    ? "border-blue-500 bg-gray-700 shadow-lg"
                    : "border-gray-600 hover:border-gray-500 bg-gray-800 hover:bg-gray-750"
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`h-4 w-4 rounded-full border mr-3 ${
                      selectedModel === model.id
                        ? "bg-blue-500 border-blue-500"
                        : "bg-transparent border-gray-400"
                    }`}
                  />
                  <h3 className="font-medium text-gray-100">{model.name}</h3>
                </div>
                <p className="text-sm text-gray-400 mt-2 pl-7">
                  {model.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Add the difficulty and the number of questions */}
        <div className="pt-3 text-gray-100 flex flex-col items-center justify-center gap-6 mb-8 md:flex-row">
          <div className="w-64">
            <label className="block text-sm font-medium text-gray-100 mb-1 text-center md:text-left">
              Select Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full border border-gray-600 bg-gray-800 text-gray-400 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="exam level">Exam Level</option>
            </select>
          </div>

          {/* Question Count Selector */}
          <div className="w-64">
            <label className="block text-sm font-medium text-gray-100 mb-1 text-center md:text-left">
              Number of Questions
            </label>
            <select
              value={numQuestions}
              onChange={(e) =>
                setNumQuestions(
                  e.target.value === "auto" ? "auto" : Number(e.target.value)
                )
              }
              className="w-full border border-gray-600 bg-gray-800 text-gray-400 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="auto">Auto</option>
              {[...Array(8)].map((_, i) => {
                const val = (i + 1) * 5;
                return (
                  <option key={val} value={val}>
                    {val}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="form-group text-gray-100 mt-5">
          <label htmlFor="input">Enter your text here:</label>
          <textarea
            id="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or copy and paste your text here..."
            rows={10}
            required
            className="bg-gray-800 focus:outline-none"
          />
          {errorMessage && (
            <p className="text-red-500 text-sm">{errorMessage}</p>
          )}
          <p className="text-gray-400 text-sm mt-2 text-right">
            {input.length} characters
          </p>
        </div>

        {/* <div className="form-group text-gray-100 pb-5">
          <label htmlFor="input">
            Enter special instructions here (optional):
          </label>
          <textarea
            id="input"
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="Enter special instructions..."
            rows={3}
            className="bg-gray-800 focus:outline-none"
          />
        </div> */}

        <button type="submit" className="generate-button">
          Generate
        </button>
      </form>
    </div>
  );
}
