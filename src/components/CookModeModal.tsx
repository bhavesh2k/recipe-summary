'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  ListFilter,
  CheckCircle2,
  Trophy,
  RotateCcw,
} from 'lucide-react';
import { Recipe, UnitSystem } from '@/types/recipe';
import { convertAndScale } from '@/lib/unit-conversion';
import { StepTimer } from './StepTimer';
import { useTheme } from '@/context/ThemeContext';

interface CookModeModalProps {
  recipe: Recipe;
  servings: number;
  unitSystem: UnitSystem;
  isOpen: boolean;
  onClose: () => void;
}

export function CookModeModal({
  recipe,
  servings,
  unitSystem,
  isOpen,
  onClose,
}: CookModeModalProps) {
  const { theme, setTheme } = useTheme();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [showIngredientsDrawer, setShowIngredientsDrawer] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);

  const scaleFactor = servings / (recipe.servings || 1);

  // Screen Wake Lock API
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && isOpen) {
          wakeLock = await navigator.wakeLock.request('screen');
          setWakeLockActive(true);
          wakeLock.addEventListener('release', () => {
            setWakeLockActive(false);
          });
        }
      } catch (err) {
        console.warn('Wake Lock request error:', err);
      }
    };

    if (isOpen) {
      requestWakeLock();
    }

    return () => {
      if (wakeLock) {
        wakeLock.release().catch(() => {});
      }
      setWakeLockActive(false);
    };
  }, [isOpen]);

  const nextStep = useCallback(() => {
    if (currentStepIdx < recipe.steps.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    }
  }, [currentStepIdx, recipe.steps.length]);

  const prevStep = useCallback(() => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx((prev) => prev - 1);
    }
  }, [currentStepIdx]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        prevStep();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, nextStep, prevStep, onClose]);

  if (!isOpen) return null;

  const currentStep = recipe.steps[currentStepIdx];
  const isAllCompleted = Object.values(completedSteps).filter(Boolean).length === recipe.steps.length;

  const toggleStepCompleted = (idx: number) => {
    setCompletedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col select-none transition-colors duration-200 ${
        theme === 'pastel'
          ? 'bg-[#fdfbf7] text-zinc-900'
          : theme === 'light'
          ? 'bg-zinc-50 text-zinc-900'
          : 'bg-zinc-950 text-zinc-100'
      }`}
    >
      {/* Ambient pastel mesh background when in pastel mode */}
      {theme === 'pastel' && (
        <div
          className="absolute inset-0 pointer-events-none -z-10 opacity-75"
          style={{
            backgroundImage: `
              radial-gradient(at 0% 0%, rgba(254, 215, 170, 0.45) 0px, transparent 50%),
              radial-gradient(at 100% 0%, rgba(254, 205, 211, 0.4) 0px, transparent 50%),
              radial-gradient(at 50% 35%, rgba(254, 243, 199, 0.35) 0px, transparent 60%),
              radial-gradient(at 100% 100%, rgba(209, 250, 229, 0.35) 0px, transparent 50%),
              radial-gradient(at 0% 100%, rgba(254, 226, 226, 0.3) 0px, transparent 50%)
            `,
          }}
        />
      )}

      {/* Top Bar */}
      <header className="px-4 sm:px-6 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
            👨‍🍳
          </div>
          <div>
            <h1 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 line-clamp-1 max-w-[150px] sm:max-w-md">
              {recipe.title}
            </h1>
            <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
              <span>{servings} servings</span>
              {wakeLockActive && (
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <Sun className="w-3 h-3" /> Screen awake
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* In-Cook-Mode Theme Selector */}
          <div className="flex items-center p-0.5 rounded-xl bg-amber-500/10 dark:bg-zinc-800 border border-amber-500/20 dark:border-zinc-700 text-xs">
            <button
              type="button"
              onClick={() => setTheme('pastel')}
              className={`px-2 py-1 rounded-lg flex items-center gap-1 font-semibold transition-all ${
                theme === 'pastel'
                  ? 'bg-white dark:bg-zinc-700 text-amber-700 dark:text-amber-300 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              title="Pastel Light (Default)"
            >
              <span>🌸</span>
              <span className="hidden md:inline">Pastel</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`px-2 py-1 rounded-lg flex items-center gap-1 font-semibold transition-all ${
                theme === 'light'
                  ? 'bg-white dark:bg-zinc-700 text-amber-700 dark:text-amber-300 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              title="Clean White Light"
            >
              <span>☀️</span>
              <span className="hidden md:inline">Light</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`px-2 py-1 rounded-lg flex items-center gap-1 font-semibold transition-all ${
                theme === 'dark'
                  ? 'bg-white dark:bg-zinc-700 text-amber-500 dark:text-amber-300 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              title="Dark Mode"
            >
              <span>🌙</span>
              <span className="hidden md:inline">Dark</span>
            </button>
          </div>

          {/* Quick Ingredients Drawer Button */}
          <button
            type="button"
            onClick={() => setShowIngredientsDrawer(!showIngredientsDrawer)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm ${
              showIngredientsDrawer
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ingredients</span>
          </button>

          {/* Close Cook Mode */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors shadow-sm"
            title="Exit Cook Mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5">
        <div
          className="bg-amber-500 h-1.5 transition-all duration-300 shadow-sm shadow-amber-500/50"
          style={{ width: `${((currentStepIdx + 1) / recipe.steps.length) * 100}%` }}
        />
      </div>

      {/* Main Cooking Stage */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-4xl mx-auto w-full text-center relative overflow-y-auto">
        {isAllCompleted && (
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-sm font-semibold animate-bounce shadow-sm">
            <Trophy className="w-4 h-4" /> All steps completed! Bon appétit!
          </div>
        )}

        <div className="text-amber-600 dark:text-amber-500 font-bold uppercase tracking-widest text-sm mb-3">
          Step {currentStepIdx + 1} of {recipe.steps.length}
        </div>

        <p className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-relaxed md:leading-normal text-zinc-900 dark:text-zinc-50 max-w-3xl mb-8">
          {currentStep?.instruction}
        </p>

        {/* Step Timer if present */}
        {currentStep?.timerSeconds && currentStep.timerSeconds > 0 && (
          <div className="mb-8 scale-125 origin-center">
            <StepTimer durationSeconds={currentStep.timerSeconds} label="Step Timer" />
          </div>
        )}

        {/* Chef Tip */}
        {currentStep?.tip && (
          <div className="bg-white dark:bg-zinc-900 border border-amber-200/80 dark:border-zinc-800 rounded-2xl p-4 max-w-xl text-left text-sm text-zinc-800 dark:text-zinc-300 flex items-start gap-3 shadow-md shadow-amber-500/5">
            <span className="text-lg">💡</span>
            <div>
              <strong className="text-amber-600 dark:text-amber-400 block text-xs uppercase tracking-wide font-semibold mb-0.5">
                Pro Tip
              </strong>
              {currentStep.tip}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Floating Navigation */}
      <footer className="p-4 sm:p-6 border-t border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center justify-between max-w-4xl mx-auto w-full gap-3 transition-colors">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStepIdx === 0}
          className="px-4 sm:px-5 py-3 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:pointer-events-none font-semibold text-sm text-zinc-700 dark:text-zinc-300 flex items-center gap-2 transition-colors shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" /> <span className="hidden sm:inline">Previous</span>
        </button>

        <button
          type="button"
          onClick={() => toggleStepCompleted(currentStepIdx)}
          className={`px-4 sm:px-5 py-3 rounded-2xl border text-sm font-semibold flex items-center gap-2 transition-all shadow-sm ${
            completedSteps[currentStepIdx]
              ? 'bg-emerald-500 text-white border-emerald-500'
              : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{completedSteps[currentStepIdx] ? 'Step Completed' : 'Mark as Done'}</span>
        </button>

        {currentStepIdx < recipe.steps.length - 1 ? (
          <button
            type="button"
            onClick={nextStep}
            className="px-5 sm:px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <span>Next Step</span> <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setCompletedSteps({});
              setCurrentStepIdx(0);
            }}
            className="px-4 sm:px-5 py-3 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-sm flex items-center gap-2 shadow-sm"
          >
            <RotateCcw className="w-4 h-4" /> Restart
          </button>
        )}
      </footer>

      {/* Ingredients Slide-Over Drawer */}
      {showIngredientsDrawer && (
        <div className="absolute inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>📋</span> Ingredients ({servings} servings)
            </h3>
            <button
              onClick={() => setShowIngredientsDrawer(false)}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 overflow-y-auto space-y-2 flex-1">
            {recipe.ingredients.map((ing, idx) => {
              const { amount, unit } = convertAndScale(
                ing.amount,
                ing.unit,
                scaleFactor,
                unitSystem
              );
              return (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800 text-sm flex items-baseline justify-between shadow-sm"
                >
                  <span className="text-zinc-800 dark:text-zinc-200 font-medium">{ing.item}</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400 shrink-0 ml-2">
                    {amount} {unit}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
