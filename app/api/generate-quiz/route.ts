import { NextRequest, NextResponse } from 'next/server';
import { QuizSchema, type QuestionCount } from '@/lib/schemas';
import { verifyExcerpts } from '@/lib/validate';
import { generateQuizFromGemini } from '@/lib/gemini';
import { FALLBACK_QUIZ, FALLBACK_SOURCE_TEXT } from '@/lib/fallback-quiz';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, count } = body as { text: string; count: QuestionCount };

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'No text provided.', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    if (![5, 10, 15].includes(count)) {
      return NextResponse.json(
        { error: 'Invalid question count. Must be 5, 10, or 15.', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    // --- Fallback path ---
    // When USE_FALLBACK=true, skip the AI call and return the bundled sample quiz.
    // The fallback still runs through Zod — it's not exempt from validation.
    if (process.env.USE_FALLBACK === 'true') {
      const parsed = QuizSchema.safeParse(FALLBACK_QUIZ);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Fallback quiz failed validation.', code: 'VALIDATION_FAILED' },
          { status: 500 }
        );
      }
      // Slice to the requested count
      const questions = parsed.data.questions.slice(0, Math.min(count, parsed.data.questions.length));
      return NextResponse.json({ questions, isFallback: true });
    }

    // --- Real AI path ---
    // Truncate to ~3000 words — enough for 15 strong questions, keeps Gemini fast.
    const MAX_WORDS = 3000;
    const words = text.trim().split(/\s+/);
    const truncatedText = words.length > MAX_WORDS
      ? words.slice(0, MAX_WORDS).join(' ')
      : text;

    console.log(`[generate-quiz] text=${words.length} words, sending ${truncatedText.split(/\s+/).length} words to Gemini`);

    // 1. Call Gemini
    let rawData: unknown;
    try {
      const t0 = Date.now();
      rawData = await Promise.race([
        generateQuizFromGemini(truncatedText, count),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timed out')), 120000)
        ),
      ]);
      console.log(`[generate-quiz] Gemini responded in ${Date.now() - t0}ms`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[generate-quiz] Gemini call failed:', message);
      return NextResponse.json(
        { error: 'Failed to generate quiz. Please try again.', code: 'GENERATION_FAILED' },
        { status: 502 }
      );
    }

    // 2. Zod validation — check the structure
    const parsed = QuizSchema.safeParse(rawData);
    if (!parsed.success) {
      console.error('[generate-quiz] Zod validation failed:', parsed.error.flatten());
      return NextResponse.json(
        { error: 'The AI returned an unexpected format. Please try again.', code: 'VALIDATION_FAILED' },
        { status: 502 }
      );
    }

    // 3. Domain validation — excerpts must appear in the truncated source text
    const { verified, dropped, sufficient } = verifyExcerpts(
      parsed.data.questions,
      truncatedText,
      count
    );

    if (dropped > 0) {
      console.warn(`[generate-quiz] Dropped ${dropped} questions with unverifiable excerpts.`);
    }

    if (!sufficient) {
      return NextResponse.json(
        {
          error: 'Too many generated questions could not be verified against your document. Please try again.',
          code: 'INSUFFICIENT_VERIFIED_QUESTIONS',
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ questions: verified });
  } catch (err) {
    console.error('[generate-quiz] Unexpected error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.', code: 'UNKNOWN_ERROR' },
      { status: 500 }
    );
  }
}
