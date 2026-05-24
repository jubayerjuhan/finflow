'use client';

import { useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useAppSelector((s) => (s as any).theme?.mode ?? 'system');

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      applyTheme(mode === 'dark');
    }
  }, [mode]);

  return <>{children}</>;
}
