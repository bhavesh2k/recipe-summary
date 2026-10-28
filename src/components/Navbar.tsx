'use client';

import React from 'react';
import { ChefHat, Bookmark } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface NavbarProps {
  savedCount: number;
  onOpenCookbook: () => void;
}

export function Navbar({
  savedCount,
  onOpenCookbook,
}: NavbarProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-[#fdfbf7]/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-amber-500/10 dark:border-zinc-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center">
              cook<span className="text-amber-500">.ai</span>
            </span>
            <p className="text-[11px] text-zinc-500 leading-none hidden sm:block">
              Turn reels & cooking videos into recipes
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Selector: Light (Pastel), Dark */}
          <div className="flex items-center p-0.5 rounded-xl bg-amber-500/10 dark:bg-zinc-800/80 border border-amber-500/20 dark:border-zinc-700 text-xs">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-semibold transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-white dark:bg-zinc-700 text-amber-700 dark:text-amber-300 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              title="Light Theme"
            >
              <span>☀️</span>
              <span className="hidden sm:inline">Light</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-semibold transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-white dark:bg-zinc-700 text-amber-500 dark:text-amber-300 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              title="Dark Theme"
            >
              <span>🌙</span>
              <span className="hidden sm:inline">Dark</span>
            </button>
          </div>

          {/* Cookbook button */}
          <button
            type="button"
            onClick={onOpenCookbook}
            className="px-3.5 py-2 rounded-xl border border-amber-500/15 dark:border-zinc-800 bg-[#fdfbf7]/60 dark:bg-zinc-900/60 hover:bg-white dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-sm"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
            <span className="hidden xs:inline">Cookbook</span>
            {savedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
