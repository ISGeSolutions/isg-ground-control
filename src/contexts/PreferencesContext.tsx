import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type GridDensity = 'compact' | 'default' | 'comfortable';
export type DefaultView = 'grid' | 'calendar' | 'next' | 'series' | 'heatmap';

interface Preferences {
  gridDensity: GridDensity;
  defaultView: DefaultView;
  autoRefreshInterval: number; // 0 = off, otherwise seconds
  showPastDepartures: boolean;
}

interface PreferencesContextType extends Preferences {
  setGridDensity: (d: GridDensity) => void;
  setDefaultView: (v: DefaultView) => void;
  setAutoRefreshInterval: (s: number) => void;
  setShowPastDepartures: (b: boolean) => void;
}

const STORAGE_KEY = 'ops-preferences';

const defaults: Preferences = {
  gridDensity: 'default',
  defaultView: 'grid',
  autoRefreshInterval: 0,
  showPastDepartures: true,
};

function load(): Preferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch {}
  return defaults;
}

const PreferencesContext = createContext<PreferencesContextType | null>(null);

export const usePreferences = () => {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
};

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [prefs, setPrefs] = useState<Preferences>(load);

  const persist = useCallback((next: Preferences) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const update = useCallback(<K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPrefs(prev => {
      const next = { ...prev, [key]: value };
      persist(next);
      return next;
    });
  }, [persist]);

  return (
    <PreferencesContext.Provider value={{
      ...prefs,
      setGridDensity: (v) => update('gridDensity', v),
      setDefaultView: (v) => update('defaultView', v),
      setAutoRefreshInterval: (v) => update('autoRefreshInterval', v),
      setShowPastDepartures: (v) => update('showPastDepartures', v),
    }}>
      {children}
    </PreferencesContext.Provider>
  );
};

/** Returns Tailwind padding classes for grid cells based on density */
export function densityClasses(density: GridDensity) {
  switch (density) {
    case 'compact': return { cell: 'px-1.5 py-0.5 text-[10px]', header: 'px-1.5 py-1 text-[9px]' };
    case 'comfortable': return { cell: 'px-3 py-2.5 text-xs', header: 'px-3 py-2.5 text-[11px]' };
    default: return { cell: 'px-2 py-1.5 text-xs', header: 'px-2 py-2 text-[10px]' };
  }
}
