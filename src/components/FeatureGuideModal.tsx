'use client';

import React from 'react';
import {
  X,
  Sparkles,
  Smartphone,
  Clock,
  ShoppingCart,
  BookMarked,
  ChefHat,
  ArrowRight,
} from 'lucide-react';

interface FeatureGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTryTextMode?: () => void;
}

export function FeatureGuideModal({
  isOpen,
  onClose,
  onTryTextMode,
}: FeatureGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-amber-500/20 dark:border-zinc-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl relative p-5 sm:p-7">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Welcome to cook.ai
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Your AI-powered kitchen companion — here&apos;s how to get the most out of it:
            </p>
          </div>
        </div>

        {/* Features List */}
        <div className="space-y-3.5">
          {/* Feature 1: Not just links, any dish! */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/20 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs sm:text-sm">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
                1. No Link Needed — Create Any Dish or Use Leftovers
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                Besides Instagram Reels &amp; YouTube Shorts, click the <strong>&quot;Paste Caption / Text&quot;</strong> tab! You can simply type <em>any dish name</em> (e.g. <em>&quot;Garlic Butter Tuscan Salmon&quot;</em>) or list random leftover ingredients in your fridge to generate a complete, professional recipe.
              </p>
              {onTryTextMode && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onTryTextMode();
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 hover:underline cursor-pointer"
                >
                  Try the text generator now <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Feature 2: Cook Mode */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="text-xs sm:text-sm">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
                2. Hands-Free &quot;Cook Mode&quot; (Screen Won&apos;t Turn Off)
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                Tap <strong>Cook Mode</strong> on any recipe for a distraction-free fullscreen view with large step fonts. Powered by the <strong>Screen Wake Lock API</strong>, your phone or tablet stays awake on your stand so you never touch the screen with messy hands.
              </p>
            </div>
          </div>

          {/* Feature 3: Timers */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-xs sm:text-sm">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
                3. One-Click Inline Step Timers
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                Step cooking times (e.g. <em>&quot;bake for 25 mins&quot;</em>) are automatically detected and given instant countdown timers with audio chimes.
              </p>
            </div>
          </div>

          {/* Feature 4: Smart Shopping List */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div className="text-xs sm:text-sm">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
                4. Aisle-Sorted Grocery Lists &amp; Serving Scaling
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                Dynamic multipliers ($0.5\times$, $1\times$, $2\times$, $3\times$) recalculate quantities instantly, and shopping lists are automatically sorted by grocery aisles (<em>Produce, Dairy, Meat, Pantry, Spices</em>).
              </p>
            </div>
          </div>

          {/* Feature 5: Cookbook */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <BookMarked className="w-4 h-4" />
            </div>
            <div className="text-xs sm:text-sm">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
                5. My Cookbook (Saved Locally)
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                Save any extracted recipe to your browser&apos;s offline cookbook with 1-click. No account or sign-up needed.
              </p>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            Got it, let&apos;s cook! 🍳
          </button>
        </div>
      </div>
    </div>
  );
}
