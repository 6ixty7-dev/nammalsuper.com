'use client';

import { useState, useEffect, useCallback } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('our-space-dark-mode');
    if (saved === 'true') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem('our-space-dark-mode', String(next));
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  }, []);

  return { isDark, toggle };
}
