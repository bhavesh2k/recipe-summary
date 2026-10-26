'use client';

import React, { useState } from 'react';
import {
  Bookmark,
  X,
  Trash2,
  Clock,
  Flame,
  Search,
  ExternalLink,
  ChefHat,
} from 'lucide-react';
import { Recipe } from '@/types/recipe';

interface CookbookDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedRecipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onDeleteRecipe: (recipeId: string) => void;
}

export function CookbookDrawer({
  isOpen,
  onClose,
  savedRecipes,
  onSelectRecipe,
  onDeleteRecipe,
}: CookbookDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  if (!isOpen) return null;

  // Gather unique tags
  const allTags = Array.from(
    new Set(savedRecipes.flatMap((r) => r.dietaryTags || []))
  );

  const filtered = savedRecipes.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ingredients.some((ing) => ing.item.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = selectedTag ? r.dietaryTags?.includes(selectedTag) : true;

    return matchesSearch && matchesTag;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Bookmark className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">My Cookbook</h2>
              <p className="text-xs text-zinc-500">
                {savedRecipes.length} saved {savedRecipes.length === 1 ? 'recipe' : 'recipes'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Tag Filter */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 space-y-3 bg-zinc-50 dark:bg-zinc-900/40">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or ingredient..."
              className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {allTags.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className={`px-2.5 py-1 rounded-lg border font-medium shrink-0 transition-colors ${
                  selectedTag === null
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100'
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-2.5 py-1 rounded-lg border font-medium shrink-0 transition-colors ${
                    selectedTag === tag
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recipe List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto mb-3">
                <ChefHat className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                No recipes found
              </p>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                {savedRecipes.length === 0
                  ? 'Extract a recipe or click "Save to Cookbook" on any recipe card to build your library.'
                  : 'Try adjusting your search query or filter tags.'}
              </p>
            </div>
          ) : (
            filtered.map((r) => (
              <div
                key={r.id}
                className="group relative p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 hover:border-amber-300 dark:hover:border-amber-600/50 hover:shadow-md transition-all cursor-pointer"
                onClick={() => {
                  onSelectRecipe(r);
                  onClose();
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {r.title}
                  </h3>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRecipe(r.id);
                    }}
                    className="p-1 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title="Delete Recipe"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-zinc-500 line-clamp-2 mb-3">
                  {r.description}
                </p>

                <div className="flex items-center gap-3 text-xs text-zinc-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-500" />
                    {r.totalTimeMinutes}m
                  </span>
                  {r.nutrition?.calories && (
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-500" />
                      {r.nutrition.calories} kcal
                    </span>
                  )}
                  {r.sourceUrl && (
                    <span className="ml-auto flex items-center gap-1 text-[11px] text-zinc-400 capitalize">
                      {r.platform || 'Link'}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
