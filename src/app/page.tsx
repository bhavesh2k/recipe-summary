'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { RecipeInput } from '@/components/RecipeInput';
import { RecipeCard } from '@/components/RecipeCard';
import { CookModeModal } from '@/components/CookModeModal';
import { ShoppingListModal } from '@/components/ShoppingListModal';
import { CookbookDrawer } from '@/components/CookbookDrawer';
import { FeatureGuideModal } from '@/components/FeatureGuideModal';
import { Recipe, UnitSystem } from '@/types/recipe';
import { SAMPLE_RECIPES } from '@/lib/sample-recipes';
import { Utensils, X, Sparkles, Smartphone, Clock, ArrowRight } from 'lucide-react';

export default function Home() {
  // Active recipe defaults to the Fluffy Japanese Cloud YouTube recipe for immediate exploration
  const defaultRecipe = SAMPLE_RECIPES.find((r) => r.id === 'sample-souffle-pancakes') || SAMPLE_RECIPES[0];
  const [activeRecipe, setActiveRecipe] = useState<Recipe>(defaultRecipe);
  const [servings, setServings] = useState<number>(defaultRecipe.servings || 2);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');

  // Modals & Drawers state
  const [isCookModeOpen, setIsCookModeOpen] = useState(false);
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);
  const [isCookbookOpen, setIsCookbookOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [inputMode, setInputMode] = useState<'url' | 'upload' | 'text'>('url');

  // Welcome helper banner for first-time visitors
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return !localStorage.getItem('cook_ai_welcomed');
    } catch {
      return false;
    }
  });

  const dismissWelcomeBanner = () => {
    setShowWelcomeBanner(false);
    try {
      localStorage.setItem('cook_ai_welcomed', 'true');
    } catch {}
  };

  // Persistence: Saved Cookbook
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('cook_ai_cookbook') || localStorage.getItem('reelbite_cookbook');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Update servings when active recipe changes
  const handleSelectRecipe = (recipe: Recipe) => {
    setActiveRecipe(recipe);
    setServings(recipe.servings || 2);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const handleSaveToCookbook = (recipe: Recipe) => {
    if (typeof window !== 'undefined') {
      const exists = savedRecipes.some((r) => r.id === recipe.id);
      let updated: Recipe[];

      if (exists) {
        // Unsave
        updated = savedRecipes.filter((r) => r.id !== recipe.id);
      } else {
        // Save
        updated = [recipe, ...savedRecipes];
      }

      setSavedRecipes(updated);
      localStorage.setItem('cook_ai_cookbook', JSON.stringify(updated));
    }
  };

  const handleDeleteSavedRecipe = (recipeId: string) => {
    if (typeof window !== 'undefined') {
      const updated = savedRecipes.filter((r) => r.id !== recipeId);
      setSavedRecipes(updated);
      localStorage.setItem('cook_ai_cookbook', JSON.stringify(updated));
    }
  };

  const isCurrentRecipeSaved = savedRecipes.some((r) => r.id === activeRecipe?.id);

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-zinc-900 dark:text-zinc-100">
      {/* Navigation */}
      <Navbar
        savedCount={savedRecipes.length}
        onOpenCookbook={() => setIsCookbookOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:py-12 space-y-10 sm:space-y-14">
        {/* Hero Section */}
        <section className="text-center space-y-4 max-w-2xl mx-auto pt-2 sm:pt-4">
          {/* Quick Guide Trigger Pill */}
          <div className="inline-flex items-center justify-center">
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-200 text-xs font-semibold border border-amber-500/25 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <span>💡</span>
              <span>New to cook.ai? See what you can do</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold ml-0.5">&rarr;</span>
            </button>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.15]">
            Transform Cooking Reels into{' '}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Step-by-Step Recipes
            </span>
          </h1>

          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
            Paste any Instagram Reel or YouTube Shorts link — or describe any dish or leftover ingredients. Get scaled macros, step timers, and hands-free Cook Mode.
          </p>
        </section>

        {/* Input & Extractor Card */}
        <section className="space-y-4">
          {/* First-time helper banner */}
          {showWelcomeBanner && (
            <div className="max-w-3xl mx-auto p-4 rounded-3xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/20 relative animate-in fade-in slide-in-from-top-2 duration-300">
              <button
                type="button"
                onClick={dismissWelcomeBanner}
                className="absolute top-3.5 right-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer p-1 rounded-lg"
                title="Dismiss tip"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-start gap-3 pr-6">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="space-y-2 flex-1 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">
                      Quick Tips to get started:
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsGuideOpen(true)}
                      className="text-amber-700 dark:text-amber-300 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer w-fit"
                    >
                      View full guide <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5 text-zinc-600 dark:text-zinc-400">
                    <div
                      onClick={() => {
                        setInputMode('text');
                        dismissWelcomeBanner();
                      }}
                      className="bg-white/70 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-amber-500/15 cursor-pointer hover:border-amber-500/40 transition-colors"
                    >
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1 mb-0.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Any Dish Name
                      </span>
                      <span>Click <strong>Paste Text</strong> to type any dish or fridge leftovers.</span>
                    </div>
                    <div className="bg-white/70 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-amber-500/15">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1 mb-0.5">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-500" /> Cook Mode
                      </span>
                      <span>Keeps your screen awake on kitchen stands without dimming.</span>
                    </div>
                    <div className="bg-white/70 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-amber-500/15">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1 mb-0.5">
                        <Clock className="w-3.5 h-3.5 text-blue-500" /> Step Timers
                      </span>
                      <span>One-click countdown timers with chimes so food never burns.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <RecipeInput
            onRecipeExtracted={handleSelectRecipe}
            activeMode={inputMode}
            onModeChange={setInputMode}
          />
        </section>

        {/* Display Active Recipe Card */}
        {activeRecipe && (
          <section id="recipe-view" className="scroll-mt-24">
            <RecipeCard
              recipe={activeRecipe}
              servings={servings}
              unitSystem={unitSystem}
              onServingsChange={setServings}
              onUnitSystemChange={setUnitSystem}
              onLaunchCookMode={() => setIsCookModeOpen(true)}
              onOpenShoppingList={() => setIsShoppingListOpen(true)}
              onSaveToCookbook={handleSaveToCookbook}
              isSaved={isCurrentRecipeSaved}
            />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-zinc-200/80 dark:border-zinc-800 py-8 text-center text-xs text-zinc-500 print:hidden">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-zinc-700 dark:text-zinc-300">
            <Utensils className="w-4 h-4 text-amber-500" />
            <span>cook.ai — Social Media Recipe Summarizer</span>
          </div>

          <p className="flex items-center gap-1">
            Built with Next.js &amp; Multimodal AI
          </p>

          <p className="text-zinc-400 text-[11px]">
            Tip: Open in mobile browser and &quot;Add to Home Screen&quot; for the kitchen app.
          </p>
        </div>
      </footer>

      {/* Modals & Slide-Overs */}
      {activeRecipe && (
        <>
          <CookModeModal
            recipe={activeRecipe}
            servings={servings}
            unitSystem={unitSystem}
            isOpen={isCookModeOpen}
            onClose={() => setIsCookModeOpen(false)}
          />

          <ShoppingListModal
            recipe={activeRecipe}
            servings={servings}
            unitSystem={unitSystem}
            isOpen={isShoppingListOpen}
            onClose={() => setIsShoppingListOpen(false)}
          />
        </>
      )}

      <CookbookDrawer
        isOpen={isCookbookOpen}
        onClose={() => setIsCookbookOpen(false)}
        savedRecipes={savedRecipes}
        onSelectRecipe={handleSelectRecipe}
        onDeleteRecipe={handleDeleteSavedRecipe}
      />

      <FeatureGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onTryTextMode={() => {
          setInputMode('text');
          window.scrollTo({ top: 320, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
