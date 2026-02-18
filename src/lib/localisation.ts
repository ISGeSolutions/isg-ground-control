/**
 * Localisation model with precedence: user > branch > company > tenant.
 *
 * Covers: language, currency, number separators, decimal places,
 * date format presets (EMEA + Americas), timezone, RTL (future-ready).
 */

export interface LocaleConfig {
  language: string;        // BCP 47: 'en-GB', 'de-DE', 'ar-SA', etc.
  currency: string;        // ISO 4217: 'GBP', 'USD', 'EUR'
  timezone: string;        // IANA: 'Europe/London', 'America/New_York'
  dateFormat: string;      // e.g. 'dd/MM/yyyy', 'MM/dd/yyyy'
  timeFormat: '12h' | '24h';
  numberSeparator: ',' | '.' | ' ';  // thousands
  decimalSeparator: '.' | ',';
  decimalPlaces: number;
  rtl: boolean;            // future-ready
}

// ─── Regional presets ────────────────────────────────────────────────────────

export const LOCALE_PRESETS: Record<string, LocaleConfig> = {
  'en-GB': {
    language: 'en-GB', currency: 'GBP', timezone: 'Europe/London',
    dateFormat: 'dd/MM/yyyy', timeFormat: '24h',
    numberSeparator: ',', decimalSeparator: '.', decimalPlaces: 2,
    rtl: false,
  },
  'en-US': {
    language: 'en-US', currency: 'USD', timezone: 'America/New_York',
    dateFormat: 'MM/dd/yyyy', timeFormat: '12h',
    numberSeparator: ',', decimalSeparator: '.', decimalPlaces: 2,
    rtl: false,
  },
  'de-DE': {
    language: 'de-DE', currency: 'EUR', timezone: 'Europe/Berlin',
    dateFormat: 'dd.MM.yyyy', timeFormat: '24h',
    numberSeparator: '.', decimalSeparator: ',', decimalPlaces: 2,
    rtl: false,
  },
  'fr-FR': {
    language: 'fr-FR', currency: 'EUR', timezone: 'Europe/Paris',
    dateFormat: 'dd/MM/yyyy', timeFormat: '24h',
    numberSeparator: ' ', decimalSeparator: ',', decimalPlaces: 2,
    rtl: false,
  },
  'es-MX': {
    language: 'es-MX', currency: 'MXN', timezone: 'America/Mexico_City',
    dateFormat: 'dd/MM/yyyy', timeFormat: '24h',
    numberSeparator: ',', decimalSeparator: '.', decimalPlaces: 2,
    rtl: false,
  },
  'ar-SA': {
    language: 'ar-SA', currency: 'SAR', timezone: 'Asia/Riyadh',
    dateFormat: 'dd/MM/yyyy', timeFormat: '12h',
    numberSeparator: ',', decimalSeparator: '.', decimalPlaces: 2,
    rtl: true,
  },
  'pt-BR': {
    language: 'pt-BR', currency: 'BRL', timezone: 'America/Sao_Paulo',
    dateFormat: 'dd/MM/yyyy', timeFormat: '24h',
    numberSeparator: '.', decimalSeparator: ',', decimalPlaces: 2,
    rtl: false,
  },
};

/**
 * Merge locale configs with precedence: user > branch > company > tenant.
 * Each level can partially override the previous.
 */
export function resolveLocale(
  tenant: Partial<LocaleConfig>,
  company?: Partial<LocaleConfig>,
  branch?: Partial<LocaleConfig>,
  user?: Partial<LocaleConfig>,
): LocaleConfig {
  const base = LOCALE_PRESETS['en-GB']; // ultimate fallback
  return {
    ...base,
    ...tenant,
    ...company,
    ...branch,
    ...user,
  } as LocaleConfig;
}

// ─── Formatting helpers ──────────────────────────────────────────────────────

export function formatNumber(value: number, locale: LocaleConfig): string {
  return new Intl.NumberFormat(locale.language, {
    minimumFractionDigits: locale.decimalPlaces,
    maximumFractionDigits: locale.decimalPlaces,
  }).format(value);
}

export function formatCurrency(value: number, locale: LocaleConfig): string {
  return new Intl.NumberFormat(locale.language, {
    style: 'currency',
    currency: locale.currency,
    minimumFractionDigits: locale.decimalPlaces,
    maximumFractionDigits: locale.decimalPlaces,
  }).format(value);
}

export function formatDate(date: Date | string, locale: LocaleConfig): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale.language, {
    timeZone: locale.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

export function formatTime(date: Date | string, locale: LocaleConfig): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale.language, {
    timeZone: locale.timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: locale.timeFormat === '12h',
  }).format(d);
}

export function formatDateTime(date: Date | string, locale: LocaleConfig): string {
  return `${formatDate(date, locale)} ${formatTime(date, locale)}`;
}
