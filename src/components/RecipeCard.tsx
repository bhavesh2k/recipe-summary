'use client';

import React, { useState } from 'react';
import {
  Clock,
  Flame,
  ChefHat,
  Bookmark,
  Check,
  ShoppingCart,
  Printer,
  ExternalLink,
  Minus,
  Plus,
  Play,
  Share2,
  CheckSquare,
  Square,
  Lightbulb,
} from 'lucide-react';
import { Recipe, UnitSystem } from '@/types/recipe';
import { convertAndScale } from '@/lib/unit-conversion';
import { StepTimer } from './StepTimer';

interface RecipeCardProps {
  recipe: Recipe;
  servings: number;
  unitSystem: UnitSystem;
  onServingsChange: (newServings: number) => void;
  onUnitSystemChange: (newSystem: UnitSystem) => void;
  onLaunchCookMode: () => void;
  onOpenShoppingList: () => void;
  onSaveToCookbook: (recipe: Recipe) => void;
  isSaved: boolean;
}

export function RecipeCard({
  recipe,
  servings,
  unitSystem,
  onServingsChange,
  onUnitSystemChange,
  onLaunchCookMode,
  onOpenShoppingList,
  onSaveToCookbook,
  isSaved,
}: RecipeCardProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [copiedLink, setCopiedLink] = useState(false);

  const scaleFactor = servings / (recipe.servings || 1);

  // Group ingredients by category
  const groupedIngredients = recipe.ingredients.reduce((acc, ing) => {
    const cat = ing.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ing);
    return acc;
  }, {} as Record<string, typeof recipe.ingredients>);

  const toggleIngredient = (id: string) => {
    setCheckedIngredients((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleStep = (stepNum: number) => {
    setCheckedSteps((prev) => ({ ...prev, [stepNum]: !prev[stepNum] }));
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = recipe.sourceUrl || window.location.href;
      if (navigator.share) {
        navigator.share({
          title: recipe.title,
          text: `Check out this recipe for ${recipe.title}!`,
          url: shareUrl,
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(shareUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    }
  };

  // Scaled macros
  const scaledCalories = Math.round((recipe.nutrition.calories || 0));
  const scaledProtein = Math.round((recipe.nutrition.protein || 0));
  const scaledCarbs = Math.round((recipe.nutrition.carbs || 0));
  const scaledFat = Math.round((recipe.nutrition.fat || 0));

  const getSourceLabel = () => {
    const url = (recipe.sourceUrl || '').toLowerCase();
    const platform = recipe.platform;

    if (platform === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
      if (url.includes('/shorts/')) return 'Original Short';
      return 'Original Video';
    }
    if (platform === 'instagram' || url.includes('instagram.com')) {
      return 'Original Reel';
    }
    if (platform === 'tiktok' || url.includes('tiktok.com')) {
      return 'Original TikTok';
    }
    if (platform === 'pinterest' || url.includes('pinterest.com') || url.includes('pin.it')) {
      return 'Original Pin';
    }
    return 'Original Video';
  };

  return (
    <article className="w-full max-w-4xl mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl overflow-hidden print:border-none print:shadow-none">
      {/* Top Banner / Hero */}
      <div className="p-6 sm:p-8 md:p-10 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            {recipe.platform && (
              <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
                {recipe.platform}
              </span>
            )}
            <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold">
              {recipe.difficulty}
            </span>
            {recipe.creatorName && (
              <span className="text-xs text-zinc-500 font-medium">
                by <strong className="text-zinc-800 dark:text-zinc-200">{recipe.creatorName}</strong>
              </span>
            )}
          </div>

          {/* Share & Source Link */}
          <div className="flex items-center gap-2 print:hidden">
            {recipe.sourceUrl && (
              <a
                href={recipe.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {getSourceLabel()} <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
              title="Share Recipe"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50 mb-3 leading-tight">
          {recipe.title}
        </h1>

        <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed max-w-3xl mb-6">
          {recipe.description}
        </p>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/40">
            <span className="text-[11px] font-semibold uppercase text-zinc-400 tracking-wider block mb-1">
              Prep Time
            </span>
            <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100 font-bold text-base sm:text-lg">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>{recipe.prepTimeMinutes}m</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/40">
            <span className="text-[11px] font-semibold uppercase text-zinc-400 tracking-wider block mb-1">
              Cook Time
            </span>
            <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100 font-bold text-base sm:text-lg">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>{recipe.cookTimeMinutes}m</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/40">
            <span className="text-[11px] font-semibold uppercase text-zinc-400 tracking-wider block mb-1">
              Total Time
            </span>
            <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100 font-bold text-base sm:text-lg">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>{recipe.totalTimeMinutes}m</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/40">
            <span className="text-[11px] font-semibold uppercase text-zinc-400 tracking-wider block mb-1">
              Servings
            </span>
            <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100 font-bold text-base sm:text-lg">
              <ChefHat className="w-4 h-4 text-amber-500" />
              <span>{servings}</span>
            </div>
          </div>
        </div>

        {/* Dietary Tags */}
        {recipe.dietaryTags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {recipe.dietaryTags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Nutrition / Macros Bar */}
      <div className="px-6 sm:px-8 py-4 bg-amber-50/50 dark:bg-amber-950/20 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
            Nutritional Estimation
          </span>
          <span className="text-xs text-zinc-500">Per serving values</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-semibold">
          <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-800 dark:text-zinc-200">
            <span className="text-zinc-400 mr-1.5 font-normal">Calories</span>
            <strong className="text-sm font-bold text-orange-600 dark:text-orange-400">
              {scaledCalories}
            </strong>{' '}
            kcal
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-800 dark:text-zinc-200">
            <span className="text-zinc-400 mr-1.5 font-normal">Protein</span>
            <strong className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {scaledProtein}g
            </strong>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-800 dark:text-zinc-200">
            <span className="text-zinc-400 mr-1.5 font-normal">Carbs</span>
            <strong className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {scaledCarbs}g
            </strong>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-800 dark:text-zinc-200">
            <span className="text-zinc-400 mr-1.5 font-normal">Fat</span>
            <strong className="text-sm font-bold text-amber-600 dark:text-amber-400">
              {scaledFat}g
            </strong>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Tooling Bar */}
      <div className="px-6 sm:px-8 py-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 bg-zinc-50/70 dark:bg-zinc-900/40 print:hidden">
        {/* Left: Serving Scaler & Unit System */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Servings Counter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 mr-1">
              Servings:
            </span>
            <button
              type="button"
              onClick={() => onServingsChange(Math.max(1, servings - 1))}
              className="w-8 h-8 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 flex items-center justify-center text-zinc-700 dark:text-zinc-300 font-bold transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center font-bold text-sm text-zinc-900 dark:text-zinc-100">
              {servings}
            </span>
            <button
              type="button"
              onClick={() => onServingsChange(servings + 1)}
              className="w-8 h-8 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 flex items-center justify-center text-zinc-700 dark:text-zinc-300 font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Multipliers */}
          <div className="hidden sm:flex items-center gap-1 text-xs">
            {[0.5, 1, 2, 3].map((mult) => {
              const target = Math.round((recipe.servings || 1) * mult);
              return (
                <button
                  key={mult}
                  type="button"
                  onClick={() => onServingsChange(target)}
                  className={`px-2 py-1 rounded-lg border font-semibold transition-colors ${
                    servings === target
                      ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                      : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100'
                  }`}
                >
                  {mult}×
                </button>
              );
            })}
          </div>

          {/* Unit System Toggle */}
          <div className="flex items-center bg-zinc-200/70 dark:bg-zinc-800 p-0.5 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => onUnitSystemChange('metric')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                unitSystem === 'metric'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Metric (g/ml)
            </button>
            <button
              type="button"
              onClick={() => onUnitSystemChange('imperial')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                unitSystem === 'imperial'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Imperial (cups/oz)
            </button>
          </div>
        </div>

        {/* Right: Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Cook Mode Launch Button */}
          <button
            type="button"
            onClick={onLaunchCookMode}
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Cook Mode</span>
          </button>

          {/* Shopping List Button */}
          <button
            type="button"
            onClick={onOpenShoppingList}
            className="px-3.5 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Shopping List</span>
          </button>

          {/* Save to Cookbook */}
          <button
            type="button"
            onClick={() => onSaveToCookbook(recipe)}
            className={`px-3.5 py-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isSaved
                ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          {/* Print / PDF */}
          <button
            type="button"
            onClick={handlePrint}
            className="p-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 text-zinc-600 dark:text-zinc-400 transition-colors"
            title="Print or Save as PDF"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Layout: Ingredients (Left) & Steps (Right) */}
      <div className="p-6 sm:p-8 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        {/* Left Column: Ingredients */}
        <section className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <h2 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>🛒</span> Ingredients
            </h2>
            <span className="text-xs text-zinc-500 font-medium">
              {recipe.ingredients.length} items
            </span>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedIngredients).map(([category, items]) => (
              <div key={category} className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  {category}
                </h3>
                <div className="space-y-1.5">
                  {items.map((ing, idx) => {
                    const key = `${category}-${idx}-${ing.item}`;
                    const isChecked = !!checkedIngredients[key];
                    const { amount, unit } = convertAndScale(
                      ing.amount,
                      ing.unit,
                      scaleFactor,
                      unitSystem
                    );

                    return (
                      <div
                        key={key}
                        onClick={() => toggleIngredient(key)}
                        className={`flex items-start gap-3 p-2.5 rounded-xl cursor-pointer select-none transition-all ${
                          isChecked
                            ? 'bg-zinc-100/60 dark:bg-zinc-800/40 text-zinc-400 line-through'
                            : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-800 dark:text-zinc-200'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0 text-zinc-400">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </div>
                        <div className="text-sm leading-snug">
                          <strong className="font-bold text-zinc-950 dark:text-zinc-50 mr-1.5">
                            {amount} {unit}
                          </strong>
                          <span>{ing.item}</span>
                          {ing.notes && (
                            <span className="text-xs text-zinc-500 italic ml-1">
                              ({ing.notes})
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Column: Steps / Instructions */}
        <section className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <h2 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>🍳</span> Method & Steps
            </h2>
            <span className="text-xs text-zinc-500 font-medium">
              {recipe.steps.length} steps
            </span>
          </div>

          <div className="space-y-4">
            {recipe.steps.map((step) => {
              const isChecked = !!checkedSteps[step.stepNumber];

              return (
                <div
                  key={step.stepNumber}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isChecked
                      ? 'bg-zinc-50/70 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800/80 opacity-70'
                      : 'bg-white dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Step Checkbox Pill */}
                    <button
                      type="button"
                      onClick={() => toggleStep(step.stepNumber)}
                      className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                        isChecked
                          ? 'bg-emerald-500 text-white'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-200'
                      }`}
                    >
                      {isChecked ? <Check className="w-3.5 h-3.5" /> : step.stepNumber}
                    </button>

                    <div className="flex-1 space-y-2.5">
                      <p
                        className={`text-sm sm:text-base leading-relaxed ${
                          isChecked
                            ? 'line-through text-zinc-400'
                            : 'text-zinc-800 dark:text-zinc-200'
                        }`}
                      >
                        {step.instruction}
                      </p>

                      {/* Interactive Step Timer */}
                      {step.timerSeconds && step.timerSeconds > 0 && (
                        <div className="pt-1">
                          <StepTimer
                            durationSeconds={step.timerSeconds}
                            label={`Step ${step.stepNumber}`}
                          />
                        </div>
                      )}

                      {/* Chef Tip on this step */}
                      {step.tip && (
                        <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>{step.tip}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Overall Chef Tips Section */}
          {recipe.chefTips && recipe.chefTips.length > 0 && (
            <div className="mt-8 p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-zinc-800/80 dark:to-zinc-800/40 border border-amber-200/80 dark:border-zinc-700 space-y-2.5">
              <h3 className="font-bold text-sm text-amber-950 dark:text-amber-200 flex items-center gap-2">
                <span>💡</span> Chef&apos;s Pro Tips & Variations
              </h3>
              <ul className="space-y-1.5 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                {recipe.chefTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </article>
  );
}
