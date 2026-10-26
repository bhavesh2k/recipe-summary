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
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950 text-zinc-100 select-none">
      {/* Top Bar */}
      <header className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
            👨‍🍳
          </div>
          <div>
            <h1 className="font-bold text-sm sm:text-base text-zinc-100 line-clamp-1 max-w-[200px] sm:max-w-md">
              {recipe.title}
            </h1>
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <span>{servings} servings</span>
              {wakeLockActive && (
                <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                  <Sun className="w-3 h-3" /> Screen awake
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Ingredients Drawer Button */}
          <button
            type="button"
            onClick={() => setShowIngredientsDrawer(!showIngredientsDrawer)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              showIngredientsDrawer
                ? 'bg-amber-500 text-zinc-950 border-amber-400'
                : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ingredients</span>
          </button>

          {/* Close Cook Mode */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
            title="Exit Cook Mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-800 h-1.5">
        <div
          className="bg-amber-500 h-1.5 transition-all duration-300"
          style={{ width: `${((currentStepIdx + 1) / recipe.steps.length) * 100}%` }}
        />
      </div>

      {/* Main Cooking Stage */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-4xl mx-auto w-full text-center relative overflow-y-auto">
        {isAllCompleted && (
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-sm font-semibold animate-bounce">
            <Trophy className="w-4 h-4" /> All steps completed! Bon appétit!
          </div>
        )}

        <div className="text-amber-500 font-bold uppercase tracking-widest text-sm mb-3">
          Step {currentStepIdx + 1} of {recipe.steps.length}
        </div>

        <p className="text-2xl sm:text-3xl md:text-4xl font-medium leading-relaxed md:leading-normal text-zinc-100 max-w-3xl mb-8">
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
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 max-w-xl text-left text-sm text-zinc-300 flex items-start gap-3 shadow-lg">
            <span className="text-lg">💡</span>
            <div>
              <strong className="text-amber-400 block text-xs uppercase tracking-wide font-semibold mb-0.5">
                Pro Tip
              </strong>
              {currentStep.tip}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Floating Navigation */}
      <footer className="p-6 border-t border-zinc-800/80 bg-zinc-900/80 backdrop-blur-md flex items-center justify-between max-w-4xl mx-auto w-full">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStepIdx === 0}
          className="px-5 py-3 rounded-2xl bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 disabled:opacity-40 disabled:pointer-events-none font-semibold text-sm flex items-center gap-2 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        <button
          type="button"
          onClick={() => toggleStepCompleted(currentStepIdx)}
          className={`px-5 py-3 rounded-2xl border text-sm font-semibold flex items-center gap-2 transition-all ${
            completedSteps[currentStepIdx]
              ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
              : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          {completedSteps[currentStepIdx] ? 'Step Completed' : 'Mark as Done'}
        </button>

        {currentStepIdx < recipe.steps.length - 1 ? (
          <button
            type="button"
            onClick={nextStep}
            className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            Next Step <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setCompletedSteps({});
              setCurrentStepIdx(0);
            }}
            className="px-5 py-3 rounded-2xl bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-300 font-semibold text-sm flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Restart
          </button>
        )}
      </footer>

      {/* Ingredients Slide-Over Drawer */}
      {showIngredientsDrawer && (
        <div className="absolute inset-y-0 right-0 w-full sm:w-96 bg-zinc-900 border-l border-zinc-800 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="font-bold text-base text-zinc-100 flex items-center gap-2">
              <span>📋</span> Ingredients ({servings} servings)
            </h3>
            <button
              onClick={() => setShowIngredientsDrawer(false)}
              className="p-1 rounded-lg text-zinc-400 hover:text-white"
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
                  className="p-2.5 rounded-xl bg-zinc-800/60 border border-zinc-800 text-sm flex items-baseline justify-between"
                >
                  <span className="text-zinc-200">{ing.item}</span>
                  <span className="font-mono font-bold text-amber-400 shrink-0 ml-2">
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
