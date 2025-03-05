import React, { useState } from "react";
// import { invokeBedrockModel } from "../services/bedrock"; // Import the Bedrock service

export default function HomePage() {
  const [input, setInput] = useState(""); 
  const [response, setResponse] = useState(""); 
  const [isLoading, setIsLoading] = useState(false); 

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setIsLoading(true); 

    try {

      // const response = await invokeBedrockModel(input);
      // setResponse(response.results[0].outputText);
    
    } catch (error) {
      console.error("Error invoking Bedrock model:", error);
      setResponse("An error occurred. Please try again."); // Handle errors
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Amazon Bedrock Demo</h2>


      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="input">
            Enter your prompt:
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="input"
            type="paragraph"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter transcript..."
            rows={10} // Adjusts height
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={isLoading} // Disable button while loading
          >
            {isLoading ? "Generating..." : "Submit"}
          </button>
        </div>
      </form>

      <div>Under Development.</div>
      {/* {response && (
        <div className="mt-6 bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-md">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Response:</h3>
          <p className="text-gray-700">{response}</p>
        </div>
      )} */}
    </div>
  );
}