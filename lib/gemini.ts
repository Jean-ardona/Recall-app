import { GoogleGenAI, Type } from '@google/genai';
import type { QuestionCount } from './schemas';

const apiKey   = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';

if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable is not set.');
}

const ai = new GoogleGenAI({ apiKey });

// The JSON schema passed to Gemini to enforce structured output.
// Tells the model exactly what shape to return — Zod still validates after.
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question:     { type: Type.STRING },
          options:      { type: Type.ARRAY, items: { type: Type.STRING } },
          correctIndex: { type: Type.NUMBER },
          explanation:  { type: Type.STRING },
          excerpt:      { type: Type.STRING },
        },
        required: ['question', 'options', 'correctIndex', 'explanation', 'excerpt'],
      },
    },
  },
  required: ['questions'],
};

/**
 * Calls Gemini to generate a quiz from source text.
 * Returns the raw parsed JSON — caller must run Zod + verifyExcerpts.
 */
export async function generateQuizFromGemini(
  text: string,
  count: QuestionCount
): Promise<unknown> {
  const prompt = `You are a quiz generator. Create ${count} multiple-choice questions based ONLY on the text below.

Rules:
- Every question must be directly answerable from the provided text. Do not use outside knowledge.
- Each question must have exactly 4 answer options.
- correctIndex is the 0-based index of the correct option (0, 1, 2, or 3).
- explanation: 1–2 sentences explaining why the answer is correct, based on the text.
- excerpt: a short phrase copied VERBATIM from the text (max ~25 words) that supports the answer. Do not paraphrase.
- Vary the position of the correct answer across questions.

Text:
---
${text}
---

Return exactly ${count} questions.`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema,
    },
  });

  const raw = response.text;
  if (!raw) throw new Error('Gemini returned an empty response.');
  return JSON.parse(raw);
}
