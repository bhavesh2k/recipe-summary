'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { RecipeInput } from '@/components/RecipeInput';
import { RecipeCard } from '@/components/RecipeCard';
import { CookModeModal } from '@/components/CookModeModal';
import { ShoppingListModal } from '@/components/ShoppingListModal';
import { CookbookDrawer } from '@/components/CookbookDrawer';
import { Recipe, UnitSystem } from '@/types/recipe';
import { SAMPLE_RECIPES } from '@/lib/sample-recipes';
import { Utensils } from 'lucide-react';

export default function Home() {
  // Active recipe defaults to the first rich sample recipe for immediate exploration
  const [activeRecipe, setActiveRecipe] = useState<Recipe>(SAMPLE_RECIPES[0]);
  const [servings, setServings] = useState<number>(SAMPLE_RECIPES[0].servings || 2);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');

  // Modals & Drawers state
  const [isCookModeOpen, setIsCookModeOpen] = useState(false);
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);
  const [isCookbookOpen, setIsCookbookOpen] = useState(false);

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
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:py-12 space-y-12 sm:space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-4 max-w-2xl mx-auto pt-2 sm:pt-6">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.15]">
            Transform Cooking Reels into{' '}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Step-by-Step Recipes
            </span>
          </h1>

          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
            Paste any Instagram Reel, TikTok, or YouTube Shorts link. Get scaled ingredients, accurate macros, step countdown timers, and hands-free Cook Mode.
          </p>
        </section>

        {/* Input & Extractor Card */}
        <section>
          <RecipeInput
            onRecipeExtracted={handleSelectRecipe}
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
    </div>
  );
}
