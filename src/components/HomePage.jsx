import React, { useState } from "react";
import { invokeDeepSeek } from "../services/deepSeek"; // Import the Bedrock service
import "../styles/HomePage.css"; // Import external CSS
import QuizDisplay from "./QuizDisplay.jsx"; // Import the QuizDisplay component

export default function HomePage() {
  const [input, setInput] = useState(""); 
  const [response, setResponse] = useState(null); 
  const [isLoading, setIsLoading] = useState(false); 

  // Developing locally, so we'll use a placeholder response instead of exhausting the model
  const [isDeveloping] = useState(true);
  const [selectedModel, setSelectedModel] = useState("deepseek-chat"); // New model selection state
  const [selectedMode, setSelectedMode] = useState(""); // New model selection state
  
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
        // A placeholder response for local development
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
          "explanation": "A router is a device that forwards data packets between computers in a network, ensuring that the data reaches its intended destination. This is similar to how a post office routes letters to the correct address."
        },
        {
          "question": "What does RAM stand for in the context of servers?",
          "options": [
            "A. Random Access Memory",
            "B. Read-Only Memory",
            "C. Remote Access Module",
            "D. Routing and Management"
          ],
          "correct": "A",
          "explanation": "RAM stands for Random Access Memory, which is a type of fast memory used by servers to store and retrieve information quickly. It is essential for performing computations and running applications efficiently."
        },
        {
          "question": "What is the main purpose of a database in a server?",
          "options": [
            "A. To cool down the CPU",
            "B. To store data in a structured way for easy querying",
            "C. To route data packets",
            "D. To provide power supply to the server"
          ],
          "correct": "B",
          "explanation": "A database is used to store data in a structured format, making it easy to search, query, and retrieve information. This is crucial for applications that require quick access to large amounts of data."
        },
        {
          "question": "What is the primary function of a switch in a network?",
          "options": [
            "A. To store data permanently",
            "B. To forward data packets to the correct client within a network",
            "C. To provide cooling for the servers",
            "D. To manage the power supply"
          ],
          "correct": "B",
          "explanation": "A switch is a networking device that forwards data packets to the correct client within a network. It ensures that data reaches the intended recipient efficiently."
        },
        {
          "question": "What is the main advantage of using the cloud over traditional IT infrastructure?",
          "options": [
            "A. It requires more physical space",
            "B. It eliminates the need for maintenance and scaling",
            "C. It provides on-demand resources and scalability",
            "D. It increases the need for manual intervention"
          ],
          "correct": "C",
          "explanation": "The cloud provides on-demand resources and scalability, allowing businesses to scale up or down based on their needs without the hassle of maintaining physical servers. AWS services like EC2 (Elastic Compute Cloud) and S3 (Simple Storage Service) are examples of cloud resources that offer scalability."
        },
        {
          "question": "What is the role of a DNS server in a network?",
          "options": [
            "A. To store data permanently",
            "B. To translate domain names into IP addresses",
            "C. To provide cooling for the servers",
            "D. To manage the power supply"
          ],
          "correct": "B",
          "explanation": "A DNS (Domain Name System) server translates human-readable domain names (like www.example.com) into IP addresses that computers use to identify each other on the network. This is essential for routing data packets correctly."
        },
        {
          "question": "What is the primary function of a CPU in a server?",
          "options": [
            "A. To store data permanently",
            "B. To perform computations and calculations",
            "C. To route data packets",
            "D. To provide cooling for the server"
          ],
          "correct": "B",
          "explanation": "The CPU (Central Processing Unit) is responsible for performing computations and calculations in a server. It is the 'brain' of the server, handling tasks and processing data."
        },
        {
          "question": "What is a data center?",
          "options": [
            "A. A device that routes data packets",
            "B. A facility that houses servers and networking equipment",
            "C. A type of memory used in servers",
            "D. A cooling system for servers"
          ],
          "correct": "B",
          "explanation": "A data center is a facility that houses servers, networking equipment, and other IT infrastructure. It is designed to store, process, and manage large amounts of data efficiently."
        },
        {
          "question": "What is the main challenge of scaling traditional IT infrastructure?",
          "options": [
            "A. It is easy to scale quickly",
            "B. It requires significant time, space, and resources",
            "C. It does not require maintenance",
            "D. It is cost-effective"
          ],
          "correct": "B",
          "explanation": "Scaling traditional IT infrastructure requires significant time, space, and resources. Businesses need to purchase, install, and maintain additional servers, which can be costly and time-consuming."
        },
        {
          "question": "What is the primary benefit of using cloud computing for disaster recovery?",
          "options": [
            "A. It increases the risk of data loss",
            "B. It provides redundancy and backup options",
            "C. It requires more physical space",
            "D. It eliminates the need for maintenance"
          ],
          "correct": "B",
          "explanation": "Cloud computing provides redundancy and backup options, making it easier to recover data in the event of a disaster. AWS services like S3 (Simple Storage Service) and Glacier offer robust backup and recovery solutions."
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
                {/* From AWS maybe */}
                <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="model">Select Mode:</label>
              <select 
                id="model" 
                value={selectedMode} 
                onChange={(e) => setSelectedMode(e.target.value)}
                className="model-select"
              >
                <option value="learning">Learning Mode</option>
                <option value="testing">Testing Mode</option>
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
               <QuizDisplay 
               response={response}
               selectedMode={selectedMode}
             />
      )}
    </div>
  );
}