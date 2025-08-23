import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDark(savedTheme === 'dark');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDark(prefersDark);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      console.log('Theme set to dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      console.log('Theme set to light');
    }
  }, [dark]);

  const toggleTheme = () => {
    console.log('Toggling theme from', dark ? 'dark' : 'light', 'to', dark ? 'light' : 'dark');
    setDark(!dark);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md border border-yellow-300 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-950/20 transition-colors"
      style={{ borderColor: '#fbbf24', color: '#d97706' }}
    >
      {dark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
};

export default ThemeToggle;
