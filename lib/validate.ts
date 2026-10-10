import type { Question } from './schemas';

/** Normalizes a string for comparison: lowercase, collapse whitespace. */
function normalize(str: string): string {
  return str.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Post-Zod domain validation.
 * Checks that each question's excerpt actually appears in the source text.
 * Questions whose excerpt can't be found are dropped.
 *
 * Zod checks the shape. This checks the truth.
 * Gemini can return a perfectly valid JSON object with a hallucinated excerpt.
 * Zod won't catch that — this function will.
 */
export function verifyExcerpts(
  questions: Question[],
  sourceText: string,
  requestedCount: number
): { verified: Question[]; dropped: number; sufficient: boolean } {
  const normalizedSource = normalize(sourceText);

  const verified = questions.filter((q) =>
    normalizedSource.includes(normalize(q.excerpt))
  );

  const dropped = questions.length - verified.length;
  // Sufficient if at least half the requested count survived
  const sufficient = verified.length >= Math.ceil(requestedCount / 2);

  return { verified, dropped, sufficient };
}
