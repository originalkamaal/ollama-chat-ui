import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import React from 'react';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Chat - Ollama Powered',
  description: 'Multi-model AI chat with research capabilities',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${geist.className} bg-slate-900 text-slate-100`}>
        {children}
      </body>
    </html>
  );
}