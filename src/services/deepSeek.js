import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import OpenAI from "openai";

import { supabase } from "../supabase/client";

const DEFAULT_QUIZ_PROMPT_TEMPLATE = `
You are a JSON quiz generator.

Given the transcript below, generate a quiz with:
- Difficulty: "{{difficulty}}"
- Number of questions: {{numQuestions}}

Transcript:
"""{{transcript}}"""

Special instructions (optional if left blank):
"""{{specialInstructions}}"""

Instructions:
1. Generate exactly {{numQuestions}} (if auto, decide the amount of questions based on the transcript) multiple-choice questions based only on the content of the transcript.
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
7. Include relevant real-world applications if applicable in the explanation.

Only output valid JSON with this format — no extra text:

Output format:
Return ONLY a valid JSON object in this structure. Do NOT add any other text, markdown, or commentary.

{
  "title": "Related to the content of the transcript (string: max 50 characters)",
  "quiz": [
    {
      "question": "string",
      "options": ["option", "option", "option", "option"],
      "correct": 2,
      "explanation": "string"
    }
  ]
}
`.trim();

const DEFAULT_SUMMARY_PROMPT_TEMPLATE = `
    I am studying for the AWS Developer Associate Exam and I want you to make good notes that I can follow when watching Stephan Mareak's videos.

    I’ll give you the transcript and you will produce the best notes that are:
    - Easy to follow
    - Include use cases and real-world applications
    - Provide only the requested information without additional commentary, follow-ups, or pleasantries
    - Include a clear title
    - Use bullet points and headings for structure
    - Use tables when comparisons, feature breakdowns, or pros/cons lists are useful (but do not force a table if it doesn’t make sense)

Transcript:
"""{{transcript}}"""
`.trim();

function applyTemplate(template, vars) {
  // Supports both {{var}} and {var} placeholders
  return template
    .replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) =>
      Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key] ?? "") : ""
    )
    .replace(/\{\s*(\w+)\s*\}/g, (_, key) =>
      Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key] ?? "") : ""
    );
}

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

export const invokeDeepSeekQuizGenerator = async (transcript, specialInstructions, selectedModel, difficulty, numQuestions, userId) => {
  if (!openai) {
    throw new Error("OpenAI client is not initialized - check your API key");
  }

  // Validate and set default model
  const validModels = ['deepseek-chat', 'deepseek-r1'];
  const model = validModels.includes(selectedModel) ? selectedModel : 'deepseek-chat';

  try {
    // Fetch quizPrompt from Supabase if userId is provided
    let quizPrompt = '';
    console.log('invokeDeepSeekQuizGenerator: userId', userId);
    if (userId) {
      try {
        const { data: rows, error } = await supabase
          .from('userFolder')
          .select('quizPrompt')
          .eq('user_id', userId)
          .limit(1);
        
        if (!error && rows && rows.length > 0 && rows[0]?.quizPrompt) {
          quizPrompt = rows[0].quizPrompt;
        }
      } catch (e) {
        console.warn('Failed to fetch quizPrompt from Supabase, using default:', e);
      }
    }

    let prompt;
    
    // If quizPrompt exists, use it in a structured template
    if (quizPrompt?.trim()) {
      console.log('using the saved server side prompt')
      prompt = `You are a JSON quiz generator.

      Given the transcript below, generate a quiz with:
      - Difficulty: "${difficulty}"
      - Number of questions: ${numQuestions}

      Transcript:
      """${transcript}"""

      Instructions:
      1. Generate exactly ${numQuestions} (if auto, decide the amount of questions based on the transcript) multiple-choice questions based only on the content of the transcript.

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
      7. Include relevant real-world applications if applicable in the explanation.

      ${quizPrompt.trim()}

      Only output valid JSON with this format — no extra text:

      Output format:
      Return ONLY a valid JSON object in this structure. Do NOT add any other text, markdown, or commentary.

      {
        "title": "Related to the content of the transcript (string: max 50 characters)",
        "quiz": [
          {
            "question": "string",
            "options": ["option", "option", "option", "option"],
            "correct": 2,
            "explanation": "string"
          }
        ]
      }`;
    } else {
      console.log('using the pre-default local quiz prompt template')
      // Otherwise, use the default template with template variable replacement
      let template = DEFAULT_QUIZ_PROMPT_TEMPLATE;
      prompt = applyTemplate(template, {
        transcript,
        difficulty,
        numQuestions,
        specialInstructions: specialInstructions ?? "",
      });
    }

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

export const invokeDeepSeekSummaryGenerator = async (transcript, selectedModel, userId) => {
  if (!openai) {
    throw new Error("OpenAI client is not initialized - check your API key");
  }

  try {
    // Fetch summaryPrompt from Supabase if userId is provided
    let summaryPrompt = '';
    console.log('invokeDeepSeekSummaryGenerator: userId', userId);
    if (userId) {
      try {
        const { data: rows, error } = await supabase
          .from('userFolder')
          .select('summaryPrompt')
          .eq('user_id', userId)
          .limit(1);
        
        if (!error && rows && rows.length > 0 && rows[0]?.summaryPrompt) {
          summaryPrompt = rows[0].summaryPrompt;
        }
      } catch (e) {
        console.warn('Failed to fetch summaryPrompt from Supabase, using default:', e);
      }
    }

    let prompt;
    
    // If summaryPrompt exists, use it directly with the transcript appended
    if (summaryPrompt?.trim()) {
      console.log('using the server-side saved summary prompt template')
      prompt = `${summaryPrompt.trim()}\n\n${transcript}`;
    } else {
      // Otherwise, use the default template with template variable replacement
      console.log('using the pre-default local summary prompt template')
      let template = DEFAULT_SUMMARY_PROMPT_TEMPLATE;
      prompt = applyTemplate(template, {
        transcript,
      });
    }
    

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