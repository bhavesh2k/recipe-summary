'use client';

import React from 'react';
import { ChefHat, Bookmark } from 'lucide-react';

interface NavbarProps {
  savedCount: number;
  onOpenCookbook: () => void;
}

export function Navbar({
  savedCount,
  onOpenCookbook,
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
            <span className="font-extrabold text-lg tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center">
              cook<span className="text-amber-500">.ai</span>
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
        </div>
      </div>
    </header>
  );
}
