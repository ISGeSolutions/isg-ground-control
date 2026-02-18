import { useApiClient } from '@/contexts/ApiClientContext';
import { Switch } from '@/components/ui/switch';
import { Wifi, WifiOff } from 'lucide-react';

/**
 * Admin-only toggle to switch between Mock and Live API modes.
 * Persisted per-tenant in localStorage.
 */
export function ApiModeToggle() {
  const { mode, setMode, canToggleLive } = useApiClient();

  if (!canToggleLive) return null;

  return (
    <div className="flex items-center gap-1.5 text-[10px]">
      <WifiOff className={`w-3 h-3 ${mode === 'mock' ? 'text-primary' : 'text-muted-foreground'}`} />
      <Switch
        checked={mode === 'live'}
        onCheckedChange={(checked) => setMode(checked ? 'live' : 'mock')}
        className="scale-75"
      />
      <Wifi className={`w-3 h-3 ${mode === 'live' ? 'text-primary' : 'text-muted-foreground'}`} />
      <span className="text-muted-foreground font-mono">
        {mode === 'live' ? 'LIVE' : 'MOCK'}
      </span>
    </div>
  );
}
