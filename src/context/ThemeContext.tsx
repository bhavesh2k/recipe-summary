'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type AppTheme = 'pastel' | 'light' | 'dark';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'pastel',
  setTheme: () => {},
});

function applyDOMTheme(t: AppTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', t);
  if (t === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    if (typeof window === 'undefined') return 'pastel';
    try {
      const saved = localStorage.getItem('cook_ai_theme') as AppTheme | null;
      return saved === 'dark' || saved === 'light' || saved === 'pastel' ? saved : 'pastel';
    } catch {
      return 'pastel';
    }
  });

  useEffect(() => {
    applyDOMTheme(theme);
  }, [theme]);

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('cook_ai_theme', newTheme);
    } catch {}
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
