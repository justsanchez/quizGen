import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import OpenAI from "openai";

export let client = null;
export let openai = null;

try {
  client = new BedrockRuntimeClient({
    region: import.meta.env.VITE_REACT_APP_AWS_REGION,
    credentials: {
      accessKeyId: import.meta.env.VITE_REACT_APP_AWS_ACCESS_KEY_ID,
      secretAccessKey: import.meta.env.VITE_REACT_APP_AWS_SECRET_ACCESS_KEY,
    },
  });
} catch (error) {
  console.error("Error initializing Bedrock client:", error);
}

try {
  if (import.meta.env.VITE_DEEPSEEK_API_ACCESS_KEY) {
    openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: import.meta.env.VITE_DEEPSEEK_API_ACCESS_KEY,
      dangerouslyAllowBrowser: true
    });
  }
} catch (error) {
  console.error("Error initializing OpenAI client:", error);
}

export const invokeDeepSeekQuizGenerator = async (transcript, selectedModel) => {
  if (!openai) {
    throw new Error("OpenAI client is not initialized - check your API key");
  }

  try {
    let difficulty = "medium";
    let numQuestions = 12;
    let prompt = `
    Generate a ${difficulty} difficulty quiz with ${numQuestions} questions with this transcript.
    ${transcript}
    For each question:
    1. Phrase as a multiple choice question
    2. Provide 4 answer options
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

    const completion = await openai.chat.completions.create({
      model: selectedModel, 
      messages: [
        { role: "system", content: "You are a helpful AI quiz generator..." },
        { role: "user", content: prompt } 
      ],
    });

    if (!completion?.choices?.[0]?.message?.content) {
      throw new Error("Invalid response format from API");
    }

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error(`Quiz generation failed: ${error.message}`);
  }
};

export const invokeDeepSeekSummaryGenerator = async (transcript, selectedModel) => {
  if (!openai) {
    throw new Error("OpenAI client is not initialized - check your API key");
  }

  try {
    let prompt = `
    I am studying for the AWS AI Practitioner Exam and I want you to make good notes that i can follow when watching Stephan Mareaks Videos.
     Ill give you the transcript and you make the best notes that are easy to follow and also mention use cases and real world applications and remember
      ${transcript}
      `;
    

    const completion = await openai.chat.completions.create({
      model: selectedModel,
      messages: [
        { role: "system", content: "You are a helpful AI summary generator..." },
        { role: "user", content: prompt }
      ],
    });

    if (!completion?.choices?.[0]?.message?.content) {
      throw new Error("Invalid response format from API");
    }

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error(`Summary generation failed: ${error.message}`);
  }
};