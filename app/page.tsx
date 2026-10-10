'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, BookOpen, Loader2, X, AlertCircle } from 'lucide-react';
import { useQuiz } from '@/context/QuizContext';
import QuestionCountSelector from '@/components/QuestionCountSelector';
import GeneratingOverlay from '@/components/GeneratingOverlay';
import { countWords, getDefaultCount, type QuestionCount } from '@/lib/schemas';
import type { Question } from '@/lib/schemas';

// ── File validation limits ────────────────────────────────────────
const MAX_MB    = 5;
const MAX_PAGES = 30;
const MAX_BYTES = MAX_MB * 1024 * 1024;
const GEN_TIMEOUT_MS = 90000; // 90 s client-side timeout

type FileState =
  | { status: 'idle' }
  | { status: 'reading' }
  | { status: 'ready'; name: string; sizeLabel: string; pageCount: number; preview: string; text: string }
  | { status: 'error'; message: string; fileName: string };

export default function HomePage() {
  const router = useRouter();
  const { setQuizData } = useQuiz();
  const dropRef = useRef<HTMLDivElement>(null);

  const [fileState, setFileState]     = useState<FileState>({ status: 'idle' });
  const [pasteText, setPasteText]     = useState('');
  const [showPaste, setShowPaste]     = useState(false);
  const [questionCount, setQuestionCount] = useState<QuestionCount>(10);
  const [generating, setGenerating]   = useState(false);
  const [genError, setGenError]       = useState<string | null>(null);
  const [dragOver, setDragOver]       = useState(false);

  // The text actually sent to the API — from file or paste
  const activeText = fileState.status === 'ready'
    ? fileState.text
    : pasteText;
  const wordCount = countWords(activeText);

  // Keep question count in sync with word-count gating
  useEffect(() => {
    const def = getDefaultCount(wordCount);
    if (!def) return;
    if (def < questionCount) setQuestionCount(def);
  }, [wordCount, questionCount]);

  const canGenerate = wordCount >= 150 && !generating &&
    (fileState.status === 'ready' || (showPaste && pasteText.trim().length > 0));

  // ── File processing ───────────────────────────────────────────────
  async function processFile(file: File) {
    setGenError(null);
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (!['pdf', 'txt'].includes(ext ?? '')) {
      setFileState({ status: 'error', message: 'Only PDF and .txt files are supported.', fileName: file.name });
      return;
    }
    if (file.size > MAX_BYTES) {
      setFileState({ status: 'error', message: `This file exceeds the ${MAX_MB} MB limit. Try a smaller document.`, fileName: file.name });
      return;
    }

    setFileState({ status: 'reading' });

    if (ext === 'txt') {
      const text = await file.text();
      if (!text.trim()) {
        setFileState({ status: 'error', message: 'This file appears to be empty.', fileName: file.name });
        return;
      }
      const lines = text.split('\n').filter(l => l.trim()).slice(0, 3).join(' ');
      const sizeLabel = file.size < 1024 ? `${file.size} B` : `${(file.size / 1024).toFixed(1)} KB`;
      setFileState({ status: 'ready', name: file.name, sizeLabel, pageCount: 0, preview: lines.slice(0, 200), text });
      return;
    }

    // PDF — send to /api/extract
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/extract', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok || data.error) {
        setFileState({ status: 'error', message: data.error ?? 'Could not read this file.', fileName: file.name });
        return;
      }
      if (!data.text?.trim()) {
        setFileState({ status: 'error', message: 'This PDF has no readable text. Try a text-based PDF.', fileName: file.name });
        return;
      }
      if (data.pageCount > MAX_PAGES) {
        setFileState({ status: 'error', message: `This PDF exceeds the ${MAX_PAGES}-page limit. Try a shorter document.`, fileName: file.name });
        return;
      }
      const sizeLabel = file.size < 1024 * 1024
        ? `${(file.size / 1024).toFixed(1)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      const preview = data.text.split('\n').filter((l: string) => l.trim()).slice(0, 3).join(' ').slice(0, 200);
      setFileState({ status: 'ready', name: file.name, sizeLabel, pageCount: data.pageCount, preview, text: data.text });
    } catch {
      setFileState({ status: 'error', message: 'Could not reach the server. Please try again.', fileName: file.name });
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  // ── Generate ──────────────────────────────────────────────────────
  async function handleGenerate() {
    if (!canGenerate) return;
    setGenerating(true);
    setGenError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), GEN_TIMEOUT_MS);

      let res: Response;
      try {
        res = await fetch('/api/generate-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: activeText, count: questionCount }),
          signal: controller.signal,
        });
      } catch (err) {
        const isTimeout = err instanceof Error && err.name === 'AbortError';
        setGenError(isTimeout
          ? 'Generation timed out. Try a shorter document or fewer questions.'
          : 'Could not reach the server. Please try again.');
        return;
      } finally {
        clearTimeout(timeoutId);
      }

      const data = await res.json();
      if (!res.ok || data.error) {
        setGenError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }
      setQuizData({ questions: data.questions as Question[], extractedText: activeText, questionCount });
      router.push('/quiz');
    } catch {
      setGenError('Something went wrong. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  // How many ghost cards to show behind the main card (max 3)
  const ghostCount = Math.min(3, Math.ceil(questionCount / 5));

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '32px 0 40px',
        background: 'var(--bg)',
      }}
    >
      {/* Generating overlay — shown while waiting for Gemini */}
      {generating && <GeneratingOverlay count={questionCount} />}
      {/* Brand */}
      <header style={{ width: 'min(88vw, 400px)', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 19, letterSpacing: '-.01em', color: 'var(--ink)' }}>
          <BookOpen size={20} color="var(--accent)" />
          Recall
        </div>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--mute)' }}>
          Drop your course. Get tested on it.
        </p>
      </header>

      {/* Card stack area */}
      <div style={{ position: 'relative', width: 'min(88vw, 400px)', marginBottom: 28 }}>

        {/* Ghost cards behind */}
        {Array.from({ length: ghostCount }).map((_, i) => {
          const depth = i + 1;
          return (
            <div
              key={i}
              className="card-cover"
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 'var(--radius)',
                border: '1px solid var(--line)',
                boxShadow: 'var(--shadow)',
                transform: `translateY(${depth * 10}px) scale(${1 - depth * 0.025}) rotate(${depth % 2 ? 1.2 : -1.2}deg)`,
                zIndex: ghostCount - i,
              }}
            >
              <BookOpen size={28} color="var(--accent)" style={{ opacity: .4, position: 'relative' }} />
            </div>
          );
        })}

        {/* Main upload card */}
        <div
          ref={dropRef}
          className="paper"
          style={{
            position: 'relative',
            zIndex: ghostCount + 1,
            minHeight: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 28,
            cursor: fileState.status === 'idle' || fileState.status === 'error' ? 'pointer' : 'default',
            outline: dragOver ? `2px dashed var(--accent)` : 'none',
            outlineOffset: -3,
            transition: 'outline .15s',
          }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => {
            if (fileState.status === 'idle' || fileState.status === 'error') {
              document.getElementById('file-input')?.click();
            }
          }}
        >
          <input
            id="file-input"
            type="file"
            accept=".pdf,.txt"
            className="sr-only"
            onChange={handleFileInput}
          />

          {/* IDLE state */}
          {fileState.status === 'idle' && (
            <div className="flex flex-col items-center gap-3 text-center">
              <Upload size={32} color="var(--accent)" />
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
                Drop a PDF or .txt file
              </p>
              <p style={{ fontSize: 13, color: 'var(--mute)', margin: 0 }}>
                or click to browse
              </p>
              <p style={{ fontSize: 12, color: 'var(--mute)', margin: '4px 0 0' }}>
                PDF (text-based, max {MAX_PAGES} pages) or .txt · max {MAX_MB} MB
              </p>
            </div>
          )}

          {/* READING state */}
          {fileState.status === 'reading' && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={28} color="var(--accent)" className="animate-spin" />
              <p style={{ fontSize: 14, color: 'var(--mute)', margin: 0 }}>Reading file…</p>
            </div>
          )}

          {/* READY state */}
          {fileState.status === 'ready' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="flex items-start gap-3">
                <FileText size={22} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', margin: 0, wordBreak: 'break-word' }}>
                    {fileState.name}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--mute)', margin: '2px 0 0' }}>
                    {fileState.sizeLabel}
                    {fileState.pageCount > 0 ? ` · ${fileState.pageCount} pages` : ''}
                    {' '}·{' '}
                    <span style={{ color: 'var(--ok)', fontWeight: 500 }}>Ready</span>
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Remove file"
                  onClick={(e) => { e.stopPropagation(); setFileState({ status: 'idle' }); }}
                  style={{
                    background: 'transparent', border: 'none',
                    color: 'var(--mute)', cursor: 'pointer', padding: 4, flexShrink: 0,
                  }}
                >
                  <X size={16} />
                </button>
              </div>
              <p style={{
                fontSize: 12.5, color: 'var(--mute)', lineHeight: 1.5,
                margin: 0, padding: '8px 10px',
                background: 'var(--bg)', borderRadius: 8,
                fontStyle: 'italic',
              }}>
                {fileState.preview}…
              </p>
            </div>
          )}

          {/* ERROR state */}
          {fileState.status === 'error' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="flex items-start gap-2">
                <AlertCircle size={18} color="var(--bad)" style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--bad)', margin: 0 }}>
                    {fileState.fileName}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--bad)', margin: '4px 0 0' }}>
                    {fileState.message}
                  </p>
                </div>
              </div>
              <p style={{ fontSize: 12, color: 'var(--mute)', margin: 0 }}>
                Click or drop a new file to try again.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div style={{ width: 'min(88vw, 400px)', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Paste text toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowPaste(v => !v)}
            style={{
              background: 'none', border: 'none', padding: 0,
              fontSize: 13, color: 'var(--mute)', cursor: 'pointer',
              textDecoration: 'underline', textUnderlineOffset: 3,
            }}
          >
            {showPaste ? 'Hide text input' : 'Or paste text instead'}
          </button>
          {showPaste && (
            <textarea
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              placeholder="Paste your notes here (at least 150 words)…"
              rows={6}
              style={{
                marginTop: 8,
                width: '100%',
                borderRadius: 10,
                border: '1px solid var(--line)',
                background: 'var(--paper)',
                padding: '10px 12px',
                fontSize: 13.5,
                color: 'var(--ink)',
                resize: 'vertical',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
          )}
        </div>

        {/* Question count selector */}
        <QuestionCountSelector
          wordCount={wordCount}
          selected={questionCount}
          onChange={setQuestionCount}
          disabled={generating}
        />

        {/* Generation error */}
        {genError && (
          <div
            style={{
              background: 'var(--badbg)',
              border: '1px solid var(--bad)',
              borderRadius: 10, padding: '10px 14px',
              fontSize: 13.5, color: 'var(--bad)',
              display: 'flex', flexDirection: 'column', gap: 10,
            }}
          >
            <div className="flex items-start gap-2">
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              {genError}
            </div>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate}
              style={{
                alignSelf: 'flex-start',
                background: 'none', border: '1px solid var(--bad)',
                borderRadius: 7, padding: '5px 14px',
                fontSize: 13, fontWeight: 500,
                color: 'var(--bad)', cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Try again
            </button>
          </div>
        )}

        {/* Generate button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="btn-primary"
        >
          Generate quiz
        </button>

        {!canGenerate && !generating && wordCount > 0 && wordCount < 150 && (
          <p style={{ fontSize: 12.5, color: 'var(--mute)', textAlign: 'center', marginTop: -8 }}>
            Add {150 - wordCount} more words to enable generation.
          </p>
        )}
      </div>
    </main>
  );
}
