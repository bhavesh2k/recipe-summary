import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://cookai-web.vercel.app'),
  title: 'cook.ai - AI Recipe Extractor & Kitchen Companion',
  description: 'Convert Instagram Reels, TikTok, YouTube Shorts, and Pinterest cooking videos into structured, step-by-step recipes with nutrition, timers, and hands-free cook mode.',
  keywords: [
    'cook.ai',
    'cookai',
    'recipe converter',
    'instagram recipe converter',
    'tiktok recipe to text',
    'youtube shorts recipe',
    'ai recipe extractor',
    'cook mode',
    'cooking timers',
  ],
  openGraph: {
    title: 'cook.ai - AI Recipe Extractor & Kitchen Companion',
    description: 'Convert Instagram Reels, TikTok, YouTube Shorts, and Pinterest cooking videos into structured, step-by-step recipes.',
    url: 'https://cookai-web.vercel.app',
    siteName: 'cook.ai',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'cook.ai - AI Recipe Extractor & Kitchen Companion',
    description: 'Convert Instagram Reels, TikTok, YouTube Shorts, and Pinterest cooking videos into structured, step-by-step recipes.',
  },
  icons: {
    icon: '/cookai-avatar.png',
    apple: '/cookai-avatar.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('cook_ai_theme') || 'light';
                  if (t === 'pastel') t = 'light';
                  document.documentElement.setAttribute('data-theme', t);
                  if (t === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans transition-colors duration-200">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
