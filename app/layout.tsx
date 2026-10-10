import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QuizProvider } from '@/context/QuizContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Recall',
  description: 'Turn your notes into a quiz, instantly.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-[#FAFAFA] text-[#111]`}>
        <QuizProvider>{children}</QuizProvider>
      </body>
    </html>
  );
}
