import { NextRequest, NextResponse } from 'next/server';
import { extractPdfText } from '@/lib/extract';

const MAX_MB    = 5;
const MAX_PAGES = 150;
const MAX_BYTES = MAX_MB * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    const fileName = (file as File).name ?? '';
    const ext = fileName.split('.').pop()?.toLowerCase();

    if (!['pdf', 'txt'].includes(ext ?? '')) {
      return NextResponse.json(
        { error: 'Only PDF and .txt files are supported.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `This file exceeds the ${MAX_MB} MB limit. Try a smaller document.` },
        { status: 400 }
      );
    }

    if (ext === 'txt') {
      const text = await file.text();
      if (!text.trim()) {
        return NextResponse.json(
          { error: 'This file appears to be empty.' },
          { status: 400 }
        );
      }
      return NextResponse.json({ text, pageCount: 0 });
    }

    // PDF extraction
    const buffer = await file.arrayBuffer();
    const { text, pageCount } = await extractPdfText(buffer);

    if (!text.trim()) {
      return NextResponse.json(
        { error: 'This PDF has no readable text. Try a text-based PDF.' },
        { status: 422 }
      );
    }

    if (pageCount > MAX_PAGES) {
      return NextResponse.json(
        { error: `This PDF exceeds the ${MAX_PAGES}-page limit. Try a shorter document.` },
        { status: 422 }
      );
    }

    return NextResponse.json({ text, pageCount });
  } catch (err) {
    console.error('[extract] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Could not read this file. Please try again.' },
      { status: 500 }
    );
  }
}
