'use client';

import React, { useEffect, useRef } from 'react';
import Script from 'next/script';

interface TurnstileWidgetProps {
  onToken: (token: string) => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact' | 'invisible';
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

export function TurnstileWidget({ onToken }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  // Use configured production sitekey, or official Cloudflare non-interactive testing pass-key
  const siteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

  const initTurnstile = () => {
    if (typeof window === 'undefined' || !window.turnstile || !containerRef.current) return;
    if (widgetIdRef.current) return; // already rendered

    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        size: 'invisible',
        callback: (token: string) => {
          onToken(token);
        },
        'expired-callback': () => {
          if (widgetIdRef.current && window.turnstile) {
            window.turnstile.reset(widgetIdRef.current);
          }
        },
        'error-callback': () => {
          console.warn('Turnstile widget challenge error');
        },
      });
    } catch (e) {
      console.warn('Turnstile render warning:', e);
    }
  };

  useEffect(() => {
    initTurnstile();
    return () => {
      if (widgetIdRef.current && typeof window !== 'undefined' && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch {}
      }
    };
  }, []);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="lazyOnload"
        onLoad={initTurnstile}
      />
      <div
        ref={containerRef}
        aria-hidden="true"
        className="opacity-0 pointer-events-none absolute -left-[9999px] -top-[9999px] w-0 h-0"
      />
    </>
  );
}
