import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'cook.ai - AI Recipe Extractor & Kitchen Companion',
  description: 'Convert Instagram Reels, TikTok, YouTube Shorts, and Pinterest cooking videos into structured, step-by-step recipes with nutrition, timers, and hands-free cook mode.',
  keywords: [
    'cook.ai',
    'recipe converter',
    'instagram recipe converter',
    'tiktok recipe to text',
    'youtube shorts recipe',
    'ai recipe extractor',
    'cook mode',
    'cooking timers',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
        {children}
      </body>
    </html>
  );
}
