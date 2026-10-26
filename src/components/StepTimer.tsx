'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Timer as TimerIcon, CheckCircle2 } from 'lucide-react';
import { playTimerCompletionChime } from '@/lib/sound';

interface StepTimerProps {
  durationSeconds: number;
  label?: string;
}

export function StepTimer({ durationSeconds, label }: StepTimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            playTimerCompletionChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  const toggleRun = () => {
    if (isCompleted) {
      setTimeLeft(durationSeconds);
      setIsCompleted(false);
      setIsRunning(true);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(durationSeconds);
    setIsCompleted(false);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
        isCompleted
          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
          : isRunning
          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 shadow-sm animate-pulse'
          : 'bg-zinc-100 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
      }`}
    >
      <TimerIcon className="w-3.5 h-3.5 shrink-0" />
      <span className="font-mono font-bold tracking-tight text-sm">
        {timeFormatted}
      </span>
      {label && <span className="opacity-75 hidden sm:inline">({label})</span>}

      <div className="flex items-center gap-1 ml-1">
        <button
          type="button"
          onClick={toggleRun}
          className={`p-1 rounded-md transition-colors ${
            isCompleted
              ? 'hover:bg-emerald-200 dark:hover:bg-emerald-900/60'
              : isRunning
              ? 'hover:bg-amber-200 dark:hover:bg-amber-900/60'
              : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
          title={isCompleted ? 'Restart' : isRunning ? 'Pause' : 'Start Timer'}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          ) : isRunning ? (
            <Pause className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
        </button>

        {(isRunning || timeLeft < durationSeconds) && (
          <button
            type="button"
            onClick={handleReset}
            className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
