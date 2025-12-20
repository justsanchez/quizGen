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

  console.log('specialInstructions', specialInstructions);
  console.log('selectedModel', selectedModel);
  console.log('difficulty', difficulty);
  console.log('numQuestions', numQuestions);

  // Validate and set default model
  const validModels = ['deepseek-chat', 'deepseek-r1'];
  const model = validModels.includes(selectedModel) ? selectedModel : 'deepseek-chat';

  try {
    // ! read below
    // TODO: add a easy way to remember the quiz question and title and add that to the summary too
    // TODO: add a easy way to remember the quiz question and title and add that to the summary too
let prompt = `
You are a JSON quiz generator focused on Viktor Frankl's logotherapy and existential psychology. Given the transcript below from the book *"Man's Search for Meaning"*, generate a quiz with:

- Difficulty: "${difficulty}"
- Number of questions: ${numQuestions}

Transcript:
"""${transcript}"""

Instructions:
1. Generate exactly ${numQuestions} (if 'auto', decide based on the transcript length) multiple-choice questions based **only** on the content of the transcript.

2. Focus questions on:
   - The three main sources of meaning (creative work, love/relationships, attitude toward unavoidable suffering)
   - Key logotherapy concepts (will to meaning, existential vacuum, tragic optimism, paradoxical intention, dereflection)
   - Frankl's experiences and observations from the concentration camps
   - The contrast between logotherapy and Freudian/Adlerian psychology
   - Psychological resilience and finding purpose in suffering
   - Freedom of choice and responsibility
   - Real-life applications of logotherapy principles

3. For each question:
   - Write a clear and thought-provoking question.
   - Choose the correct answer first.
   - Create 3 plausible distractors based on common misunderstandings or partial truths.
   - Output the 4 options in **random order** (do NOT label them A/B/C/D).
   - Provide the **index (0–3)** of the correct answer in the 'correct' field.

4. Do NOT include answer letters like "A.", "B.", etc. in the 'options' array — return plain strings.

5. The correct index must match the current position of the correct answer in the shuffled list.

6. Include a **short explanation** for why the correct answer is right — rooted in logotherapy and Frankl's existential psychology.

7. Keep questions focused on *existential psychology*, *meaning-making*, *suffering and resilience*, and *human freedom* — do not include unrelated content.

Only output valid JSON with this structure — no extra text or formatting.

Output format:
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

    // TODO: make this a dynamic value with it being set in the settings of the user settings page
    let prompt = `
You are a structured summary generator for deep psychological and existential content.

You will receive a transcript or excerpt from the book *"Man's Search for Meaning"* by Viktor Frankl.

Your job is to produce study notes that are:
- Easy to follow
- Structured using clear headings and bullet points
- Focused on core concepts: logotherapy principles, the three sources of meaning, existential vacuum, tragic optimism, freedom and responsibility, and psychological resilience
- Grounded in Frankl's concentration camp experiences and real-world therapeutic applications
- Only include the requested content — no introductions, follow-up remarks, or pleasantries
- Include a clear, relevant title
- Use tables where helpful for comparisons (e.g., logotherapy vs. psychoanalysis, sources of meaning, stages of camp life), but only when they enhance clarity
- Make end analysis

Your tone should be direct and academic — designed for someone actively studying or applying this knowledge in real life.

Transcript:
"""${transcript}"""

Return only structured, well-organized notes — no extra commentary or markup.
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