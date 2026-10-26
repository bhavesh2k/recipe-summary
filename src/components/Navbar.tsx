'use client';

import React from 'react';
import { ChefHat, Bookmark, Key } from 'lucide-react';

interface NavbarProps {
  savedCount: number;
  onOpenCookbook: () => void;
  onOpenApiKey: () => void;
  hasCustomKey: boolean;
}

export function Navbar({
  savedCount,
  onOpenCookbook,
  onOpenApiKey,
  hasCustomKey,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              ReelBite
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold uppercase tracking-wider">
                AI
              </span>
            </span>
            <p className="text-[11px] text-zinc-500 leading-none hidden sm:block">
              Turn reels & cooking videos into recipes
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenCookbook}
            className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-2 transition-all active:scale-95"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
            <span>Cookbook</span>
            {savedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {savedCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenApiKey}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
              hasCustomKey
                ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
            title="Configure Gemini API Key"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">API Key</span>
            {hasCustomKey && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
          </button>
        </div>
      </div>
    </header>
  );
}
