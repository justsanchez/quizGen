import React, { useState } from "react";
import { invokeDeepSeek } from "../services/deepSeek"; // Import the Bedrock service
import "../styles/HomePage.css"; // Import external CSS

export default function HomePage() {
  const [input, setInput] = useState(""); 
  const [response, setResponse] = useState(null); 
  const [isLoading, setIsLoading] = useState(false); 

  // Developing locally, so we'll use a placeholder response instead of exhausting the model
  const [isDeveloping] = useState(true);
  const [selectedModel, setSelectedModel] = useState("deepseek-chat"); // New model selection state

  const invokeModel = async (input) => {
    if (selectedModel === "deepseek-chat") {
      return await invokeDeepSeek(input);
    }
    // Future models can be added here


    throw new Error(`Model ${selectedModel} not yet implemented.`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setIsLoading(true); 

    let deepSeekResponseRaw;
    let response;

    try {
      if (!isDeveloping) {
        deepSeekResponseRaw = await invokeModel(input);
      }

      console.log("Model response | Raw response:", deepSeekResponseRaw);

      if (isDeveloping) {
        response = {
          "quiz": [
            {
              "question": "What is the primary role of a router in a network?",
              "options": [
                "A. To store data permanently",
                "B. To forward data packets between computers in the network",
                "C. To cool down the servers",
                "D. To provide long-term storage for files"
              ],
              "correct": "B",
              "explanation": "A router is a device that forwards data packets between computers in a network, ensuring that the data reaches its intended destination."
            }
          ]
        };
      } else {
        const cleanedResponse = deepSeekResponseRaw.replace(/```json|```/g, "").trim();
        response = JSON.parse(cleanedResponse);
      }

      console.log("Model response | Parsed response:", response);

      if (response.quiz && Array.isArray(response.quiz)) {
        console.log("Model response | response.quiz:", response.quiz);
        console.log("First Question:", response.quiz[0]);
        setResponse(response.quiz);  
      } else {
        console.error("Unexpected response format:", response);
        setResponse([]);  
      }
    } catch (error) {
      console.error("Error parsing JSON from model:", error);
      setResponse([]);  
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div className="homepage-container">
      {!response && (
        <>
          <h2 className="homepage-title">AI Quiz Generator</h2>
          <form onSubmit={handleSubmit} className="homepage-form">
            <div className="form-group">
              <label htmlFor="model">Select Model:</label>
              <select 
                id="model" 
                value={selectedModel} 
                onChange={(e) => setSelectedModel(e.target.value)}
                className="model-select"
              >
                <option value="deepseek-chat">DeepSeek Chat</option>
                <option value="deepseek-reasoner">DeepSeek Reasoner</option>
                <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="input">Enter your prompt here:</label>
              <textarea
                id="input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter transcript..."
                rows={10}
                required
              />
            </div>

            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? "Generating..." : "Submit"}
            </button>
          </form>
        </>
      )}

      {/* Displaying Quiz Questions */}
      {response && response.length > 0 && (
        <div className="quiz-container">
          <h2 className="homepage-title">Generated Quiz:</h2>
          {response.map((q, index) => (
            <div key={index} className="quiz-question">
              <p className="question-text">
                <strong>Q{index + 1}: </strong> {q.question}
              </p>
              <ul className="options-list">
                {q.options.map((option, i) => (
                  <li key={i} className={option.includes("[CORRECT]") ? "correct-answer" : ""}>
                    {option.replace("[CORRECT]", "").trim()}
                  </li>
                ))}
              </ul>
              <p className="explanation"><strong>Explanation:</strong> {q.explanation}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}