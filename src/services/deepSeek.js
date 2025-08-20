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

export const invokeDeepSeekQuizGenerator = async (transcript, specialInstructions, selectedModel, difficulty, numQuestions) => {
  if (!openai) {
    throw new Error("OpenAI client is not initialized - check your API key");
  }

  // Validate and set default model
  const validModels = ['deepseek-chat', 'deepseek-r1'];
  const model = validModels.includes(selectedModel) ? selectedModel : 'deepseek-chat';

  try {
    let prompt = `
    You are a JSON quiz generator.
    
    Given the transcript below, generate a quiz with:
    - Difficulty: "${difficulty}"
    - Number of questions: ${numQuestions}
    
    Transcript:
    """${transcript}"""
    
    Instructions:
    1. Generate exactly ${numQuestions} multiple-choice questions based only on the content of the transcript.
    2. For each question:
      - Write a clear question.
      - Choose the correct answer first.
      - Create 3 plausible incorrect answers.
      - Output the 4 options in **any order** (do NOT pre-label them with A/B/C/D).
      - Track the **index (0–3)** of the correct answer in the 'correct' field.
    3. Do NOT include answer letters like "A.", "B.", etc. in the 'options' array — return plain strings.
    4. The correct index must reflect the correct answer's current position in the shuffled list.
    5. Include a short explanation for why the answer is correct.
    6. Add a brief explanation.
    7. Include relevant AWS service names if applicable in the explanation.

Only output valid JSON with this format — no extra text:
    
    Output format:
    Return ONLY a valid JSON object in this structure. Do NOT add any other text, markdown, or commentary.
    
    {
    "title": {Related to the content of the transcript, (string: max 50 characters)},
    "quiz": [
        {
          "question": "string",
          "options": ["option", "option", "option", "option"],
          "correct": 2,
          "explanation": "string"
        }
      ]
    }
    `;

    const completion = await openai.chat.completions.create({
      model: model, 
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
    - Include a title:
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