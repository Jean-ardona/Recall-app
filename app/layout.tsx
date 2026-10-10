import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QuizProvider } from '@/context/QuizContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Recall',
  description: 'Drop your course. Get tested on it.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ colorScheme: 'light' }}>
      <body className={`${inter.variable}`}>
        <QuizProvider>{children}</QuizProvider>
      </body>
    </html>
  );
}
