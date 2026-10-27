'use client';

import React, { useState } from 'react';
import {
  Link as LinkIcon,
  Sparkles,
  Upload,
  FileText,
  AlertCircle,
  Video,
  Share2,
} from 'lucide-react';
import { detectPlatform } from '@/lib/metadata-extractor';
import { Recipe } from '@/types/recipe';
import { SAMPLE_RECIPES } from '@/lib/sample-recipes';

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <polygon points="10 15 15 12 10 9" fill="currentColor" />
    </svg>
  );
}

interface RecipeInputProps {
  onRecipeExtracted: (recipe: Recipe) => void;
}

export function RecipeInput({
  onRecipeExtracted,
}: RecipeInputProps) {
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState<'url' | 'upload' | 'text'>('url');
  const [rawText, setRawText] = useState('');
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileMimeType, setFileMimeType] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState<string | null>(null);

  const detected = url ? detectPlatform(url) : null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      setError('File size too large. Please select a clip or photo under 25MB.');
      return;
    }

    setFileName(file.name);
    setFileMimeType(file.type);
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      setFileBase64(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const handleExtract = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (mode === 'url' && !url.trim()) {
      setError('Please paste a video or post URL.');
      return;
    }
    if (mode === 'upload' && !fileBase64) {
      setError('Please select an image or video file.');
      return;
    }
    if (mode === 'text' && !rawText.trim()) {
      setError('Please paste a recipe description or caption.');
      return;
    }

    setIsLoading(true);
    setLoadingStep('Connecting to AI Chef engine...');

    try {
      const timer1 = setTimeout(() => {
        setLoadingStep('Analyzing video frames, voiceover, and text overlays...');
      }, 1500);

      const timer2 = setTimeout(() => {
        setLoadingStep('Extracting ingredients, calculating nutrition, and setting timers...');
      }, 4000);

      const res = await fetch('/api/extract-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: mode === 'url' ? url.trim() : undefined,
          rawText: mode === 'text' ? rawText.trim() : undefined,
          mediaBase64: fileBase64 || undefined,
          mediaMimeType: fileMimeType || undefined,
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      let data;
      const resText = await res.text();
      try {
        data = JSON.parse(resText);
      } catch {
        if (resText.includes('An error occurred') || res.status >= 500) {
          throw new Error(
            'Instagram actively blocks automatic link scraping without a login session. You can easily extract this recipe by copying the reel\'s caption into the "Paste Caption" tab or uploading the video clip directly!'
          );
        }
        throw new Error(`Server returned error (${res.status}): ${resText.slice(0, 150)}`);
      }

      if (!res.ok || !data.success) {
        if (data.error && data.error.includes('MISSING_API_KEY')) {
          setError('Gemini API key is not configured on the server. Please check your .env.local file.');
          return;
        }
        let cleanErr = data.error || 'Failed to extract recipe.';
        if (cleanErr.startsWith('Recipe extraction failed: ')) {
          cleanErr = cleanErr.replace('Recipe extraction failed: ', '');
        }
        if (cleanErr.startsWith('LINK_BLOCKED: ')) {
          cleanErr = cleanErr.replace('LINK_BLOCKED: ', '');
        }
        if (cleanErr.startsWith('NO_RECIPE_FOUND: ')) {
          cleanErr = cleanErr.replace('NO_RECIPE_FOUND: ', '');
        }
        throw new Error(cleanErr);
      }

      onRecipeExtracted(data.recipe);
      setUrl('');
      setRawText('');
      setFileBase64(null);
      setFileName(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to extract recipe.';
      setError(msg);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const selectSample = (sample: Recipe) => {
    setError(null);
    onRecipeExtracted(sample);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Mode Tabs */}
      <div className="flex items-center justify-center gap-2 mb-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setMode('url');
            setError(null);
          }}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            mode === 'url'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" /> Social Media Link
        </button>

        <button
          type="button"
          onClick={() => {
            setMode('upload');
            setError(null);
          }}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            mode === 'upload'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'
          }`}
        >
          <Upload className="w-3.5 h-3.5" /> Video / Photo Upload
        </button>

        <button
          type="button"
          onClick={() => {
            setMode('text');
            setError(null);
          }}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            mode === 'text'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Paste Caption / Text
        </button>
      </div>

      {/* Main Input Box */}
      <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-3xl p-3 sm:p-4 shadow-xl relative transition-all">
        {mode === 'url' && (
          <form onSubmit={handleExtract} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1 flex items-center">
              <div className="absolute left-4 pointer-events-none text-zinc-400">
                {detected === 'instagram' ? (
                  <InstagramIcon className="w-5 h-5 text-pink-500" />
                ) : detected === 'youtube' ? (
                  <YoutubeIcon className="w-5 h-5 text-red-500" />
                ) : detected === 'tiktok' ? (
                  <Share2 className="w-5 h-5 text-cyan-500" />
                ) : (
                  <LinkIcon className="w-5 h-5" />
                )}
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste Instagram Reel, TikTok, YouTube Shorts, or Pinterest link..."
                disabled={isLoading}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
              {detected && detected !== 'other' && (
                <span className="absolute right-3 hidden sm:inline-block px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-700 text-[11px] font-bold uppercase text-zinc-600 dark:text-zinc-300">
                  {detected}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:pointer-events-none transition-all active:scale-95 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 fill-white" />
              <span>{isLoading ? 'Cooking...' : 'Cook It!'}</span>
            </button>
          </form>
        )}

        {mode === 'url' && detected === 'instagram' && (
          <div className="mt-3 text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/50 p-2.5 rounded-xl flex items-center gap-2">
            <span>💡</span>
            <span>
              Tip: If this reel is from a private account or blocked by Instagram&apos;s login wall, you can copy the caption into the <strong>Paste Caption</strong> tab or upload a screen recording in the <strong>Upload</strong> tab!
            </span>
          </div>
        )}

        {mode === 'upload' && (
          <div className="space-y-3">
            <label className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-amber-500 dark:hover:border-amber-400 transition-colors bg-zinc-50 dark:bg-zinc-800/40">
              <input
                type="file"
                accept="video/*,image/*"
                onChange={handleFileUpload}
                disabled={isLoading}
                className="hidden"
              />
              <Video className="w-8 h-8 text-amber-500 mb-2" />
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {fileName ? fileName : 'Click to select a video clip or carousel photo'}
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Supports MP4, MOV, WebM, PNG, JPG (up to 25MB)
              </p>
            </label>

            {fileBase64 && (
              <button
                type="button"
                onClick={() => handleExtract()}
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isLoading ? 'Analyzing Video...' : 'Analyze & Extract Recipe'}</span>
              </button>
            )}
          </div>
        )}

        {mode === 'text' && (
          <div className="space-y-3">
            <textarea
              rows={4}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste recipe description, post caption, or ingredients list..."
              disabled={isLoading}
              className="w-full p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none"
            />
            <button
              type="button"
              onClick={() => handleExtract()}
              disabled={isLoading || !rawText.trim()}
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? 'Structuring Recipe...' : 'Convert to Recipe'}</span>
            </button>
          </div>
        )}

        {/* Loading Spinner & Status */}
        {isLoading && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-center gap-3 animate-in fade-in duration-200">
            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-amber-900 dark:text-amber-200">
              {loadingStep || 'AI Chef is extracting recipe...'}
            </span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 flex items-start justify-between gap-3 text-red-700 dark:text-red-300 text-xs sm:text-sm animate-in fade-in duration-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            {(error.includes('Instagram') || error.includes('caption') || error.includes('Caption') || error.includes('platforms') || error.includes('Social') || error.includes('YouTube') || error.includes('TikTok')) && (
              <button
                type="button"
                onClick={() => {
                  setMode('text');
                  setError(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 shrink-0 ml-auto whitespace-nowrap"
              >
                Paste Caption Tab →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick Try Sample Pills */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="text-zinc-500 font-semibold mr-1">Or try a sample:</span>
        {SAMPLE_RECIPES.map((sample) => (
          <button
            key={sample.id}
            type="button"
            onClick={() => selectSample(sample)}
            className="px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-sm text-zinc-700 dark:text-zinc-300 font-medium transition-all active:scale-95"
          >
            {sample.id.includes('noodles') && '🌶️ '}
            {sample.id.includes('chicken') && '🍗 '}
            {sample.id.includes('souffle') && '🥞 '}
            {sample.title.split(' ').slice(0, 3).join(' ')}
          </button>
        ))}
      </div>
    </div>
  );
}
