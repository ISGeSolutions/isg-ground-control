import { useTheme, Palette } from '@/contexts/ThemeContext';
import { Sun, Moon, Eye } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';

const PALETTES: { id: Palette; label: string; swatch: string }[] = [
  { id: 'ocean', label: 'Ocean', swatch: 'bg-[hsl(210,80%,55%)]' },
  { id: 'forest', label: 'Forest', swatch: 'bg-[hsl(150,60%,40%)]' },
  { id: 'sunset', label: 'Sunset', swatch: 'bg-[hsl(25,90%,55%)]' },
  { id: 'mono', label: 'Mono', swatch: 'bg-[hsl(220,10%,50%)]' },
];

export const ThemeSelector = () => {
  const { palette, mode, highContrast, setPalette, toggleMode, setHighContrast } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          title="Theme settings"
          className="px-2 py-1 rounded text-muted-foreground hover:text-foreground transition-colors"
        >
          {mode === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-3 space-y-3">
        {/* Dark / Light toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            {mode === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            {mode === 'dark' ? 'Dark' : 'Light'} Mode
          </div>
          <Switch checked={mode === 'dark'} onCheckedChange={() => toggleMode()} />
        </div>

        {/* High contrast */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Eye className="w-3.5 h-3.5" />
            High Contrast
          </div>
          <Switch checked={highContrast} onCheckedChange={setHighContrast} />
        </div>

        {/* Palette */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Palette</span>
          <div className="grid grid-cols-4 gap-1.5">
            {PALETTES.map(p => (
              <button
                key={p.id}
                onClick={() => setPalette(p.id)}
                title={p.label}
                className={`flex flex-col items-center gap-1 p-1.5 rounded transition-colors ${
                  palette === p.id ? 'bg-accent ring-1 ring-ring' : 'hover:bg-accent/50'
                }`}
              >
                <div className={`w-5 h-5 rounded-full ${p.swatch} ring-1 ring-border`} />
                <span className="text-[9px] font-mono text-muted-foreground">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Accessibility note */}
        <p className="text-[9px] text-muted-foreground leading-tight">
          All palettes meet WCAG AA contrast. High contrast meets AAA (7:1+).
        </p>
      </PopoverContent>
    </Popover>
  );
};
