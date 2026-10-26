'use client';

import React, { useState } from 'react';
import { ShoppingCart, Copy, Check, X, CheckSquare, Square } from 'lucide-react';
import { Recipe, UnitSystem } from '@/types/recipe';
import { convertAndScale } from '@/lib/unit-conversion';

interface ShoppingListModalProps {
  recipe: Recipe;
  servings: number;
  unitSystem: UnitSystem;
  isOpen: boolean;
  onClose: () => void;
}

export function ShoppingListModal({
  recipe,
  servings,
  unitSystem,
  isOpen,
  onClose,
}: ShoppingListModalProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const scaleFactor = servings / (recipe.servings || 1);

  // Group ingredients by category
  const grouped = recipe.ingredients.reduce((acc, ing) => {
    const cat = ing.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ing);
    return acc;
  }, {} as Record<string, typeof recipe.ingredients>);

  const toggleItem = (name: string) => {
    setCheckedItems((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const copyToClipboard = () => {
    let text = `🛒 Shopping List for ${recipe.title} (${servings} servings)\n\n`;
    Object.entries(grouped).forEach(([cat, items]) => {
      text += `📍 ${cat}:\n`;
      items.forEach((ing) => {
        const { amount, unit } = convertAndScale(ing.amount, ing.unit, scaleFactor, unitSystem);
        text += `  • ${amount} ${unit} ${ing.item}${ing.notes ? ` (${ing.notes})` : ''}\n`;
      });
      text += '\n';
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Smart Shopping List</h2>
              <p className="text-xs text-zinc-500">
                Grouped by supermarket aisle · {servings} servings
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

        {/* List Content */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2.5">
                {category}
              </h3>
              <div className="space-y-1.5">
                {items.map((ing, idx) => {
                  const key = `${category}-${idx}-${ing.item}`;
                  const isChecked = !!checkedItems[key];
                  const { amount, unit } = convertAndScale(
                    ing.amount,
                    ing.unit,
                    scaleFactor,
                    unitSystem
                  );

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleItem(key)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                        isChecked
                          ? 'bg-zinc-100/70 dark:bg-zinc-800/40 text-zinc-400 line-through'
                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-zinc-400 shrink-0" />
                      )}
                      <span className="text-sm flex-1">
                        <strong className="font-semibold text-zinc-900 dark:text-zinc-100 mr-1.5">
                          {amount} {unit}
                        </strong>
                        {ing.item}
                        {ing.notes && (
                          <span className="text-xs text-zinc-500 italic ml-1">
                            ({ing.notes})
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-b-2xl">
          <p className="text-xs text-zinc-500">
            {Object.values(checkedItems).filter(Boolean).length} of {recipe.ingredients.length} items checked
          </p>
          <button
            type="button"
            onClick={copyToClipboard}
            className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold flex items-center gap-1.5 hover:bg-zinc-800 dark:hover:bg-white transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy List
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
