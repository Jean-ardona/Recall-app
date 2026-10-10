/**
 * Server-side text extraction utility.
 * Uses unpdf for PDFs, plain text reading for .txt files.
 */

/**
 * Extract text from a PDF buffer using unpdf.
 * Returns the extracted text and page count.
 */
export async function extractPdfText(buffer: ArrayBuffer): Promise<{ text: string; pageCount: number }> {
  // unpdf is an ESM-only package — use dynamic import
  const { extractText, getDocumentProxy } = await import('unpdf');

  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const pageCount = pdf.numPages;
  const { text } = await extractText(pdf, { mergePages: true });

  return { text: text ?? '', pageCount };
}
