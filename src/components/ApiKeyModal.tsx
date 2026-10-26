'use client';

import React, { useState } from 'react';
import { Key, ExternalLink, X, Check, Cpu } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function ApiKeyModal({ isOpen, onClose, onSaved }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') || '' : ''
  );
  const [model, setModel] = useState(() =>
    typeof window !== 'undefined'
      ? localStorage.getItem('gemini_model') || 'gemini-3.1-flash-lite'
      : 'gemini-3.1-flash-lite'
  );
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      if (apiKey.trim()) {
        localStorage.setItem('gemini_api_key', apiKey.trim());
      } else {
        localStorage.removeItem('gemini_api_key');
      }
      localStorage.setItem('gemini_model', model);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onSaved();
        onClose();
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">AI &amp; API Settings</h2>
            <p className="text-xs text-zinc-500">Configure your key and model quota</p>
          </div>
        </div>

        {/* Model Selector */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-amber-500" /> Model Selection
          </label>
          <div className="space-y-2">
            <label
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                model === 'gemini-3.1-flash-lite'
                  ? 'bg-amber-500/10 border-amber-500 text-zinc-900 dark:text-zinc-100'
                  : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <input
                type="radio"
                name="model"
                value="gemini-3.1-flash-lite"
                checked={model === 'gemini-3.1-flash-lite'}
                onChange={(e) => setModel(e.target.value)}
                className="mt-1 accent-amber-500"
              />
              <div className="text-xs">
                <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  gemini-3.1-flash-lite
                  <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                    High Quota (~1,500/day)
                  </span>
                </div>
                <p className="text-zinc-500 mt-0.5 leading-relaxed">
                  Recommended. Fast responses, high daily request limits, perfect for recipe captions and high usage.
                </p>
              </div>
            </label>

            <label
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                model === 'gemini-3.8-flash'
                  ? 'bg-amber-500/10 border-amber-500 text-zinc-900 dark:text-zinc-100'
                  : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <input
                type="radio"
                name="model"
                value="gemini-3.8-flash"
                checked={model === 'gemini-3.8-flash'}
                onChange={(e) => setModel(e.target.value)}
                className="mt-1 accent-amber-500"
              />
              <div className="text-xs">
                <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  gemini-3.8-flash
                  <span className="px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                    Limited (~20/day)
                  </span>
                </div>
                <p className="text-zinc-500 mt-0.5 leading-relaxed">
                  Flagship multimodal reasoning for video uploads and web grounding.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* API Key Input */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
            API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-500 mb-6">
          <span>Don&apos;t have a key?</span>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 dark:text-amber-400 font-medium underline underline-offset-2"
          >
            Get a free key from Google AI Studio
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" /> Saved!
              </>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
