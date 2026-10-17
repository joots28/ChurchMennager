import { useEffect, useState } from 'react';

function readSavedTheme() {
  try {
    return localStorage.getItem('churchmanager-theme') === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export default function useTheme() {
  const [theme, setTheme] = useState(readSavedTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('churchmanager-theme', theme);
    } catch {
      // A preferência continua aplicada à página mesmo se o armazenamento estiver indisponível.
    }
  }, [theme]);

  const toggleTheme = () => setTheme(current => current === 'dark' ? 'light' : 'dark');
  return { theme, toggleTheme };
}
