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
    let difficulty = "exam level";
    let numQuestions = 15;
    let prompt = `
    Generate a ${difficulty} difficulty quiz with ${numQuestions} questions with this transcript.
    ${transcript}
    For each question:
    1. Phrase as a multiple choice question.
    2. Provide 4 answer options (A, B, C, D).
    3. Randomly choose the correct answer’s letter (A, B, C, D), so it’s not always in the same position.
    4. Ensure that the correct answer's letter is **evenly distributed across all questions** — do NOT always place the answer in the middle (e.g., avoid always using B or C).
    5. Add a brief explanation.
    6. Include relevant AWS service names if applicable in the explanation.

    **Return ONLY valid JSON. Do NOT include any extra text.**
    Format the response exactly like this:
    Example:
      "quiz": [
    {
      "question": "...?",
      "options": ["...", "...", "...", "..."],
      "correct": "A",
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
    /* Need to make what cert the user is studying for dynamic
    - AWS AI Practitioner Exam
    - AWS Developer Associate
    - AWS Solutions Architect Associate
    */
    let prompt = `
    I am studying for the AWS Developer Associate Exam and I want you to make good notes that i can follow when watching Stephan Mareaks Videos.
     Ill give you the transcript and you make the best notes that are easy to follow and also mention use cases and real world applications and remember.
     Provide only the requested information without any additional commentary, follow-up suggestions, or pleasantries.
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