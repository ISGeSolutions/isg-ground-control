import { usePreferences, GridDensity, DefaultView } from '@/contexts/PreferencesContext';
import { Settings2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';

const DENSITY_OPTIONS: { id: GridDensity; label: string }[] = [
  { id: 'compact', label: 'Compact' },
  { id: 'default', label: 'Default' },
  { id: 'comfortable', label: 'Relaxed' },
];

const VIEW_OPTIONS: { id: DefaultView; label: string }[] = [
  { id: 'grid', label: 'Grid' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'next', label: 'Next Deps' },
  { id: 'series', label: 'Series' },
  { id: 'heatmap', label: 'Heatmap' },
];

const REFRESH_OPTIONS = [
  { value: 0, label: 'Off' },
  { value: 30, label: '30s' },
  { value: 60, label: '1m' },
  { value: 300, label: '5m' },
];

export const PreferencesPanel = () => {
  const {
    gridDensity, setGridDensity,
    defaultView, setDefaultView,
    autoRefreshInterval, setAutoRefreshInterval,
    showPastDepartures, setShowPastDepartures,
  } = usePreferences();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          title="Preferences"
          className="px-2 py-1 rounded text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings2 className="w-3.5 h-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-3 space-y-4">
        <h3 className="text-xs font-semibold text-foreground">Preferences</h3>

        {/* Grid Density */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Grid Density</span>
          <div className="flex gap-1">
            {DENSITY_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setGridDensity(opt.id)}
                className={`flex-1 px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                  gridDensity === opt.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Default View */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Default View</span>
          <div className="flex flex-wrap gap-1">
            {VIEW_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setDefaultView(opt.id)}
                className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                  defaultView === opt.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Auto-Refresh */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Auto-Refresh</span>
          <div className="flex gap-1">
            {REFRESH_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setAutoRefreshInterval(opt.value)}
                className={`flex-1 px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                  autoRefreshInterval === opt.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Show Past Departures */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Show Past Departures</span>
          <Switch checked={showPastDepartures} onCheckedChange={setShowPastDepartures} />
        </div>

        <p className="text-[9px] text-muted-foreground leading-tight">
          Preferences are saved locally and persist across sessions.
        </p>
      </PopoverContent>
    </Popover>
  );
};
