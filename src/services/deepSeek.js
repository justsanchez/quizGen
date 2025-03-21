import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import OpenAI from "openai";

// todo: do this when you want to add cluade 3.5 sonnet model
const client = new BedrockRuntimeClient({
  region: import.meta.env.VITE_REACT_APP_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_REACT_APP_AWS_SECRET_ACCESS_KEY,
  },
});

const openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: import.meta.env.VITE_DEEPSEEK_API_ACCESS_KEY,
        dangerouslyAllowBrowser: true // ! only for development
});





// Function to invoke a Bedrock model
export const invokeDeepSeek = async (transcript) => {
    // const input = {
    //     modelId: "deepseek.r1-v1:0",
    //     contentType: "application/json",
    //     accept: "application/json",
    //     body: JSON.stringify({
    //       inferenceConfig: {
    //         max_tokens: 512,   
    //       },
    //       messages: [
    //         {
    //           role: "user",
    //           content: prompt  // Use the actual user input
    //         }
    //       ]
    //     }),
    //   };

    let difficulty = "medium";
    let numQuestions = 10;
    let prompt = `
    Generate a ${difficulty} difficulty quiz with ${numQuestions} questions with this transcript.
    ${transcript}
    For each question:
    1. Phrase as a multiple choice question
    2. Provide 4 answer options
    3. Mark the correct answer with [CORRECT]
    4. Add a brief explanation
    5. Include relevant AWS service names if applicable in the explanation

    **Return ONLY valid JSON. Do NOT include any extra text.**
    Format the response exactly like this:
      "quiz": [
        {
          "question": "...?",
          "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
          "correct": "B",
          "explanation": "..."
        }
      ]
    `;

    try {

      const completion = await openai.chat.completions.create({
        model: "deepseek-chat", 
        messages: [
          { role: "system", content: "You are a helpful AI quiz generator that follows structured JSON formatting." },
          { role: "user", content: prompt } 
        ],
      });

    // console.log('completion.choices[0].message.content: ', completion.choices[0].message.content);

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error invoking Bedrock model:", error);
    throw error;
  }
};