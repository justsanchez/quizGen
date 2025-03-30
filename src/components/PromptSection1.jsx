import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/QuizAndNotesPage.css";

export default function PromptSection() {
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('deepseek-chat');
  const navigate = useNavigate();

  const modelOptions = [
    {
      id: "deepseek-chat",
      name: "DeepSeek Chat",
      description: "General-purpose AI model optimized for broad knowledge tasks.",
    },
    {
      id: "deepseek-reasoner",
      name: "DeepSeek Reasoner",
      description: "Specialized model focused on logical reasoning and technical domains.",
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Navigate to quiz page with state
    navigate('/quizNotes', { 
      state: { 
        transcript: input,
        model: selectedModel 
      } 
    });
  };

  return (
    <div className="quizPage-container">
      <h2 className="quizPage-title text-gray-100 pt-10">
        AWS AI Quiz Generator
      </h2>

      <form onSubmit={handleSubmit} className="quizPage-form border-none">
        <div className="form-group text-gray-300">
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

        <div className="form-group text-gray-300 mt-5">
          <label htmlFor="input">Enter your transcript here:</label>
          <textarea
            id="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter transcript..."
            rows={10}
            required
            className="bg-gray-800 focus:outline-none"
          />
        </div>

        <button type="submit" className="generate-button">
          Generate
        </button>
      </form>
    </div>
  );
}