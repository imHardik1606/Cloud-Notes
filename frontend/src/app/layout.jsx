// app/layout.jsx
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'CloudNotes - Capture Ideas, Organize Thoughts',
  description: 'A simple, powerful notes app for students, developers, and professionals.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}