import { z } from 'zod';

export const QuestionSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string()).length(4),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().min(1).max(400), // max ~2 sentences so card back never overflows
  excerpt: z.string().min(1).max(200),     // max ~25 words verbatim from source
});

export const QuizSchema = z.object({
  questions: z.array(QuestionSchema).min(1).max(15),
});

export type Question = z.infer<typeof QuestionSchema>;
export type Quiz = z.infer<typeof QuizSchema>;

// Word-count thresholds for question-count gating.
// Tune these constants if needed.
export const WORD_COUNT_THRESHOLDS = {
  MIN_WORDS: 150,    // below this: Generate is disabled entirely
  MAX_5_WORDS: 400,  // 150–400: only 5 questions available
  MAX_10_WORDS: 800, // 400–800: 5 or 10 questions available
  // 800+: all three options (5, 10, 15) available
} as const;

export type QuestionCount = 5 | 10 | 15;

/** Returns the question count options available for a given word count. */
export function getAvailableCounts(wordCount: number): QuestionCount[] {
  if (wordCount < WORD_COUNT_THRESHOLDS.MIN_WORDS) return [];
  if (wordCount < WORD_COUNT_THRESHOLDS.MAX_5_WORDS) return [5];
  if (wordCount < WORD_COUNT_THRESHOLDS.MAX_10_WORDS) return [5, 10];
  return [5, 10, 15];
}

/** Returns the default (highest available) count for a given word count. */
export function getDefaultCount(wordCount: number): QuestionCount | null {
  const counts = getAvailableCounts(wordCount);
  if (counts.length === 0) return null;
  return counts[counts.length - 1];
}

/** Counts words in a string. */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
