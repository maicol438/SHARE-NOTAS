import { useState, useEffect } from 'react';

interface UseDarkModeReturn {
  isDark: boolean;
  toggle: () => void;
}

export const useDarkMode = (): UseDarkModeReturn => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved: string | null = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggle = (): void => setIsDark((prev: boolean) => !prev);

  return { isDark, toggle };
};
