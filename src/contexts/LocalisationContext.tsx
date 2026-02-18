import { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { LocaleConfig, resolveLocale, LOCALE_PRESETS, formatNumber, formatCurrency, formatDate, formatTime, formatDateTime } from '@/lib/localisation';

interface LocalisationContextType {
  locale: LocaleConfig;
  /** Set user-level locale overrides */
  setUserOverrides: (overrides: Partial<LocaleConfig>) => void;
  /** Set config from each precedence level */
  setTenantLocale: (config: Partial<LocaleConfig>) => void;
  setCompanyLocale: (config: Partial<LocaleConfig>) => void;
  setBranchLocale: (config: Partial<LocaleConfig>) => void;
  /** Formatting utilities bound to resolved locale */
  fmt: {
    number: (v: number) => string;
    currency: (v: number) => string;
    date: (d: Date | string) => string;
    time: (d: Date | string) => string;
    dateTime: (d: Date | string) => string;
  };
}

const LocalisationContext = createContext<LocalisationContextType | null>(null);

export const useLocalisation = () => {
  const ctx = useContext(LocalisationContext);
  if (!ctx) throw new Error('useLocalisation must be used within LocalisationProvider');
  return ctx;
};

export const LocalisationProvider = ({ children }: { children: ReactNode }) => {
  const [tenantLocale, setTenantLocale] = useState<Partial<LocaleConfig>>({});
  const [companyLocale, setCompanyLocale] = useState<Partial<LocaleConfig>>({});
  const [branchLocale, setBranchLocale] = useState<Partial<LocaleConfig>>({});
  const [userOverrides, setUserOverrides] = useState<Partial<LocaleConfig>>({});

  const locale = useMemo(
    () => resolveLocale(tenantLocale, companyLocale, branchLocale, userOverrides),
    [tenantLocale, companyLocale, branchLocale, userOverrides],
  );

  const fmt = useMemo(() => ({
    number: (v: number) => formatNumber(v, locale),
    currency: (v: number) => formatCurrency(v, locale),
    date: (d: Date | string) => formatDate(d, locale),
    time: (d: Date | string) => formatTime(d, locale),
    dateTime: (d: Date | string) => formatDateTime(d, locale),
  }), [locale]);

  return (
    <LocalisationContext.Provider value={{
      locale, setUserOverrides, setTenantLocale, setCompanyLocale, setBranchLocale, fmt,
    }}>
      {children}
    </LocalisationContext.Provider>
  );
};
