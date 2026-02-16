import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Palette = 'ocean' | 'forest' | 'sunset' | 'mono';
export type Mode = 'dark' | 'light';

interface ThemeContextType {
  palette: Palette;
  mode: Mode;
  highContrast: boolean;
  setPalette: (p: Palette) => void;
  setMode: (m: Mode) => void;
  toggleMode: () => void;
  setHighContrast: (hc: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

const STORAGE_KEY = 'ops-theme';

function loadPrefs(): { palette: Palette; mode: Mode; highContrast: boolean } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { palette: 'ocean', mode: 'dark', highContrast: false };
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [palette, setPaletteState] = useState<Palette>(() => loadPrefs().palette);
  const [mode, setModeState] = useState<Mode>(() => loadPrefs().mode);
  const [highContrast, setHighContrastState] = useState(() => loadPrefs().highContrast);

  const persist = (p: Palette, m: Mode, hc: boolean) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ palette: p, mode: m, highContrast: hc }));
  };

  const setPalette = (p: Palette) => { setPaletteState(p); persist(p, mode, highContrast); };
  const setMode = (m: Mode) => { setModeState(m); persist(palette, m, highContrast); };
  const toggleMode = () => { const m = mode === 'dark' ? 'light' : 'dark'; setMode(m); };
  const setHighContrast = (hc: boolean) => { setHighContrastState(hc); persist(palette, mode, hc); };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-palette', palette);
    root.setAttribute('data-mode', mode);
    root.setAttribute('data-contrast', highContrast ? 'high' : 'normal');
    // Also set class for tailwind darkMode
    if (mode === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [palette, mode, highContrast]);

  return (
    <ThemeContext.Provider value={{ palette, mode, highContrast, setPalette, setMode, toggleMode, setHighContrast }}>
      {children}
    </ThemeContext.Provider>
  );
};
