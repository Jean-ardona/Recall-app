import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import type { QuestionCount } from './schemas';

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';

if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable is not set.');
}

const genAI = new GoogleGenerativeAI(apiKey);

// The JSON schema we pass to Gemini to enforce structured output.
// This tells Gemini exactly what shape to return.
const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    questions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          question: { type: SchemaType.STRING },
          options: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
          correctIndex: { type: SchemaType.NUMBER },
          explanation: { type: SchemaType.STRING },
          excerpt: { type: SchemaType.STRING },
        },
        required: ['question', 'options', 'correctIndex', 'explanation', 'excerpt'],
      },
    },
  },
  required: ['questions'],
};

/**
 * Calls Gemini to generate a quiz from source text.
 * Returns the raw parsed JSON — call Zod + verifyExcerpts on the result.
 */
export async function generateQuizFromGemini(
  text: string,
  count: QuestionCount
): Promise<unknown> {
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema,
    },
  });

  const prompt = `You are a quiz generator. Your task is to create ${count} multiple-choice questions based ONLY on the provided text.

Rules:
- Each question must be directly answerable from the text — do not use outside knowledge.
- Each question must have exactly 4 answer options.
- The correctIndex is the 0-based index of the correct answer in the options array.
- The explanation must be 1–2 sentences explaining why the answer is correct, based on the text.
- The excerpt must be a short, verbatim sentence or phrase copied directly from the provided text that supports the correct answer. Do not paraphrase — copy the exact words.
- Vary the position of the correct answer across questions.

Text to generate questions from:
---
${text}
---

Return exactly ${count} questions.`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  return JSON.parse(responseText);
}
