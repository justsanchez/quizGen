import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AIQuizNotes.css"; // todo: out of place, refactor this
import { useDevelopingFlag } from "../contexts/DevelopingFlag";

export default function PromptSection() {
  const [prompt, setPrompt] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState(10);
  const [promptErrorMessage, setPromptErrorMessage] = useState("");
  const [specialInstructionsErrorMessage, setSpecialInstructionsErrorMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState("deepseek-chat");
  const navigate = useNavigate();
  let [showAdvanced, setShowAdvanced] = useState(false);
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
    const wordCount = prompt.trim().split(/\s+/).length;
    let errorFlag = false;

    if (wordCount < 20) {
      setPromptErrorMessage("Please enter at least 20 words to generate a quiz.");
      errorFlag = true;
    }
    if (wordCount > 1750) {
      setPromptErrorMessage("Please keep your input under 1750 words.");
      errorFlag = true;
    }

    const specialInstructionsCount = specialInstructions.trim().split(/\s+/).length;
    if (specialInstructions && specialInstructionsCount < 20) {
      setSpecialInstructionsErrorMessage("Please enter at least 20 words to generate a quiz.");
      errorFlag = true;
    }

    if (specialInstructions && specialInstructionsCount > 100) {
      setSpecialInstructionsErrorMessage("Please keep your special instructions under 100 words.");
      errorFlag = true;
    } 

    // Proceed with quiz generation logic...
    if (errorFlag && !isDeveloping) return;
    
    setPromptErrorMessage(""); // Clear message if valid
    setSpecialInstructionsErrorMessage(""); // Clear message if valid

    // Navigate to quiz page with state
    navigate("/quizNotes", {
      state: {
        transcript: prompt,
        specialInstructions: specialInstructions,
        model: selectedModel,
        difficulty: difficulty,
        numQuestions: numQuestions,
        mode: 'generate'
      },
    });
  };

  return (
    <div className="quizPage-container">
      <h2 className="quizPage-title text-gray-100 pt-10">AI Quiz Generator</h2>

      <form onSubmit={handleSubmit} className="quizPage-form border-none">

        {/* Add the difficulty and the number of questions */}
        <div className="pt-3 text-gray-100 flex flex-col items-center justify-center gap-6 mb-8 md:flex-row w-full">
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-100 mb-1 md:text-left">
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
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-100 mb-1 md:text-left">
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
          <label htmlFor="prompt">Enter your text here:</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type or copy and paste your text here..."
            rows={10}
            className="bg-gray-800 focus:outline-none"
          />
          {promptErrorMessage && (
            <p className="text-red-500 text-sm">{promptErrorMessage}</p>
          )}
          <p className="text-gray-400 text-sm mt-2 text-right">
            {prompt.trim() ? 
              `Word Count: ${prompt.trim().split(/\s+/).length}` 
              : 'Word Count: 0'}
          </p>
        </div>

        {/* ! MAKE A ADVANCED SECTION */}

        <div className="text-gray-100 mt-5 w-full">
          <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="pb-5 flex items-center gap-2 toggle-button justify-end ml-auto">
            Toggle Advanced Section
            <svg
              className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {showAdvanced && (
          <div className="pb-25">
            <div className="form-group text-gray-100">
              <label htmlFor="model">Select Model:</label>
              <div className="grid gap-3">
                {modelOptions.map((model) => (
                  <div
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${selectedModel === model.id
                      ? "border-blue-500 bg-gray-700 shadow-lg"
                      : "border-gray-600 hover:border-gray-500 bg-gray-800 hover:bg-gray-750"
                      }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`h-4 w-4 rounded-full border mr-3 ${selectedModel === model.id
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

            <div className="form-group text-gray-100 mt-5 w-full pb-4">
              <label htmlFor="specialInstructions">
                Enter special instructions here (optional):
              </label>
              <textarea
                id="specialInstructions"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Actually set up a template for the special instructions..."
                rows={6}
                className="bg-gray-800 focus:outline-none"
              />
              {specialInstructionsErrorMessage && (
                <p className="text-red-500 text-sm">{specialInstructionsErrorMessage}</p>
              )}
            </div>
          </div>

        )}

{/* This needs to be different for mobile */}
<div
  className="
    fixed 
    bottom-0 
    left-0 
    right-0 
    bg-gray-900 
    border-t border-gray-700 
    flex justify-end 
    p-4 
    pr-10
    z-1
    md:left-64
    phone:p-1
  "
>
  <button type="submit" className="max-w-72 generate-button">
    Generate
  </button>
</div>
      </form>
    </div>
  );
}
