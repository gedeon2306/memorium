import { useEffect, useState } from 'react';

const THEMES = ['halloween', 'night', 'dark', 'synthwave', 'acid', 'dracula'] as const;
export type Theme = typeof THEMES[number];

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('halloween');

  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme;
    if (saved && THEMES.includes(saved)) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return { theme, changeTheme, themes: THEMES };
};