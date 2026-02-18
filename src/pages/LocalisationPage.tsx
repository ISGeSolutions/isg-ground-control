import { useState, useEffect } from 'react';
import { useLocalisation } from '@/contexts/LocalisationContext';
import { LocaleConfig, LOCALE_PRESETS } from '@/lib/localisation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Globe, Clock, Hash, Calendar, DollarSign, Languages, Eye } from 'lucide-react';
import { toast } from 'sonner';

const TIMEZONE_OPTIONS = [
  'Europe/London', 'Europe/Berlin', 'Europe/Paris', 'Europe/Madrid', 'Europe/Rome',
  'Europe/Amsterdam', 'Europe/Zurich', 'Europe/Vienna', 'Europe/Brussels',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Mexico_City', 'America/Sao_Paulo', 'America/Toronto', 'America/Argentina/Buenos_Aires',
  'Asia/Riyadh', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Tokyo', 'Asia/Shanghai',
  'Australia/Sydney', 'Pacific/Auckland',
];

const CURRENCY_OPTIONS = [
  { code: 'GBP', label: 'GBP – British Pound' },
  { code: 'USD', label: 'USD – US Dollar' },
  { code: 'EUR', label: 'EUR – Euro' },
  { code: 'MXN', label: 'MXN – Mexican Peso' },
  { code: 'BRL', label: 'BRL – Brazilian Real' },
  { code: 'SAR', label: 'SAR – Saudi Riyal' },
  { code: 'AUD', label: 'AUD – Australian Dollar' },
  { code: 'CAD', label: 'CAD – Canadian Dollar' },
  { code: 'CHF', label: 'CHF – Swiss Franc' },
  { code: 'JPY', label: 'JPY – Japanese Yen' },
  { code: 'INR', label: 'INR – Indian Rupee' },
  { code: 'AED', label: 'AED – UAE Dirham' },
];

const DATE_FORMAT_OPTIONS = [
  { value: 'dd/MM/yyyy', label: 'dd/MM/yyyy (31/12/2026)' },
  { value: 'MM/dd/yyyy', label: 'MM/dd/yyyy (12/31/2026)' },
  { value: 'yyyy-MM-dd', label: 'yyyy-MM-dd (2026-12-31)' },
  { value: 'dd.MM.yyyy', label: 'dd.MM.yyyy (31.12.2026)' },
  { value: 'dd-MM-yyyy', label: 'dd-MM-yyyy (31-12-2026)' },
];

const LANGUAGE_OPTIONS = Object.keys(LOCALE_PRESETS).map(key => ({
  code: key,
  label: `${key} – ${new Intl.DisplayNames([key], { type: 'language' }).of(key.split('-')[0]) ?? key}`,
}));

export default function LocalisationPage() {
  const { locale, setTenantLocale, fmt } = useLocalisation();

  const [form, setForm] = useState<LocaleConfig>({ ...locale });
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setForm({ ...locale });
    setIsDirty(false);
  }, [locale]);

  const update = <K extends keyof LocaleConfig>(key: K, value: LocaleConfig[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handlePresetApply = (presetKey: string) => {
    const preset = LOCALE_PRESETS[presetKey];
    if (preset) {
      setForm({ ...preset });
      setIsDirty(true);
    }
  };

  const handleSave = () => {
    setTenantLocale(form);
    setIsDirty(false);
    toast.success('Tenant localisation settings saved');
  };

  const handleReset = () => {
    setForm({ ...locale });
    setIsDirty(false);
  };

  const now = new Date();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Tenant Localisation</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Define the default locale settings for this tenant. These can be overridden at company, branch, and user levels.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} disabled={!isDirty}>
            Reset
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!isDirty}>
            Save Changes
          </Button>
        </div>
      </div>

      {/* Quick Preset */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            Regional Preset
          </CardTitle>
          <CardDescription className="text-xs">
            Apply a regional preset to populate all fields, then fine-tune as needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.keys(LOCALE_PRESETS).map(key => (
              <Button
                key={key}
                variant={form.language === key ? 'default' : 'outline'}
                size="sm"
                className="text-xs font-mono"
                onClick={() => handlePresetApply(key)}
              >
                {key}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language & Region */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Languages className="w-4 h-4 text-primary" />
              Language & Region
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Language</Label>
              <Select value={form.language} onValueChange={v => update('language', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map(l => (
                    <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Timezone</Label>
              <Select value={form.timezone} onValueChange={v => update('timezone', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIMEZONE_OPTIONS.map(tz => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">RTL Layout (future)</Label>
              <Switch checked={form.rtl} onCheckedChange={v => update('rtl', v)} />
            </div>
          </CardContent>
        </Card>

        {/* Currency */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Currency
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Currency Code</Label>
              <Select value={form.currency} onValueChange={v => update('currency', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map(c => (
                    <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Decimal Places</Label>
              <Select value={String(form.decimalPlaces)} onValueChange={v => update('decimalPlaces', Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4].map(n => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Date & Time */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Date & Time
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Date Format</Label>
              <Select value={form.dateFormat} onValueChange={v => update('dateFormat', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DATE_FORMAT_OPTIONS.map(d => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Time Format</Label>
              <Select value={form.timeFormat} onValueChange={v => update('timeFormat', v as '12h' | '24h')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24-hour (14:30)</SelectItem>
                  <SelectItem value="12h">12-hour (2:30 PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Number Formatting */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Hash className="w-4 h-4 text-primary" />
              Number Formatting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Thousands Separator</Label>
              <Select value={form.numberSeparator} onValueChange={v => update('numberSeparator', v as ',' | '.' | ' ')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value=",">Comma (1,000)</SelectItem>
                  <SelectItem value=".">Period (1.000)</SelectItem>
                  <SelectItem value=" ">Space (1 000)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Decimal Separator</Label>
              <Select value={form.decimalSeparator} onValueChange={v => update('decimalSeparator', v as '.' | ',')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value=".">Period (3.14)</SelectItem>
                  <SelectItem value=",">Comma (3,14)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            Live Preview
          </CardTitle>
          <CardDescription className="text-xs">
            Preview how values will appear with the current settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Date</p>
              <p className="text-sm font-mono text-foreground">{fmt.date(now)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Time</p>
              <p className="text-sm font-mono text-foreground">{fmt.time(now)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Number</p>
              <p className="text-sm font-mono text-foreground">{fmt.number(1234567.89)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Currency</p>
              <p className="text-sm font-mono text-foreground">{fmt.currency(42350.5)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
