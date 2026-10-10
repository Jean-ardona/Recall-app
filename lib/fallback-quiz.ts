import type { Quiz } from './schemas';

/**
 * A hardcoded sample quiz used when USE_FALLBACK=true.
 * Topic: The history of the internet.
 * All excerpts are verbatim from the sourceText below, ≤25 words.
 * All explanations are ≤2 sentences.
 *
 * This runs through Zod validation on every call — it's not exempt.
 */

export const FALLBACK_SOURCE_TEXT = `The internet has its origins in ARPANET, a project funded by the United States Department of Defense in the late 1960s. ARPANET was designed to allow multiple computers to communicate on a single network. The first message ever sent over ARPANET was "lo" — the system crashed before the full word "login" could be transmitted.

In 1983, ARPANET adopted TCP/IP, the set of communication protocols that still underlies the modern internet. This moment is often referred to as the birth of the internet. The domain name system, or DNS, was introduced in 1984 to replace the need to manually maintain a list of all host computers.

Tim Berners-Lee invented the World Wide Web in 1989 while working at CERN. He proposed a system of hypertext documents accessible via the internet. The first website went live in 1991. Berners-Lee made the web technology freely available, which was a key decision in enabling its rapid worldwide adoption.

The 1990s saw explosive growth of the internet. The web browser Mosaic, released in 1993, made the web accessible to non-technical users. By the end of the decade, hundreds of millions of people were online. The dot-com boom saw enormous investment in internet companies, followed by a significant crash in 2000.`;

export const FALLBACK_QUIZ: Quiz = {
  questions: [
    {
      question: 'What was the name of the early network that preceded the modern internet?',
      options: ['DARPANET', 'ARPANET', 'MILNET', 'USENET'],
      correctIndex: 1,
      explanation: 'ARPANET was funded by the US Department of Defense in the late 1960s. It was designed to allow multiple computers to communicate on a single network.',
      excerpt: 'The internet has its origins in ARPANET, a project funded by the United States Department of Defense in the late 1960s.',
    },
    {
      question: 'What was significant about the first message ever sent over ARPANET?',
      options: [
        'It was a classified military transmission',
        'It successfully sent the word "hello" in full',
        'The system crashed before the full word could be transmitted',
        'It established the first TCP/IP connection',
      ],
      correctIndex: 2,
      explanation: 'The first message was meant to be "login" but the system crashed after only "lo" was sent. This made it an unintentionally shortened first transmission.',
      excerpt: 'The first message ever sent over ARPANET was "lo" — the system crashed before the full word "login" could be transmitted.',
    },
    {
      question: 'What event is often referred to as the birth of the internet?',
      options: [
        'The invention of the World Wide Web in 1989',
        'The launch of the first website in 1991',
        'ARPANET adopting TCP/IP in 1983',
        'The release of Mosaic in 1993',
      ],
      correctIndex: 2,
      explanation: 'Adopting TCP/IP in 1983 set the communication protocols that still underlie the modern internet. This moment is widely considered the birth of the internet.',
      excerpt: 'In 1983, ARPANET adopted TCP/IP, the set of communication protocols that still underlies the modern internet.',
    },
    {
      question: 'Who invented the World Wide Web?',
      options: ['Bill Gates', 'Vint Cerf', 'Tim Berners-Lee', 'Marc Andreessen'],
      correctIndex: 2,
      explanation: 'Tim Berners-Lee invented the World Wide Web in 1989 while working at CERN. He proposed a system of hypertext documents accessible via the internet.',
      excerpt: 'Tim Berners-Lee invented the World Wide Web in 1989 while working at CERN.',
    },
    {
      question: 'What role did Berners-Lee\'s decision about web technology play in its adoption?',
      options: [
        'It slowed adoption by requiring licensing fees',
        'It enabled rapid worldwide adoption by making the technology freely available',
        'It restricted the web to academic institutions',
        'It gave the US government control over the web',
      ],
      correctIndex: 1,
      explanation: 'By not patenting the web, Berners-Lee removed barriers to adoption. This was a key factor in its rapid global spread.',
      excerpt: 'Berners-Lee made the web technology freely available, which was a key decision in enabling its rapid worldwide adoption.',
    },
  ],
};
