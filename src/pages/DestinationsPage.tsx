import { useState, useRef } from 'react';
import { Upload, Globe, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Destination {
  code: string;
  name: string;
  region?: string;
}

const INITIAL: Destination[] = [
  { code: 'AYT', name: 'Antalya', region: 'Turkey' },
  { code: 'PMI', name: 'Palma de Mallorca', region: 'Spain' },
  { code: 'TFS', name: 'Tenerife', region: 'Spain' },
  { code: 'INN', name: 'Innsbruck', region: 'Austria' },
  { code: 'GVA', name: 'Geneva', region: 'Switzerland' },
  { code: 'CUN', name: 'Cancún', region: 'Mexico' },
  { code: 'MBJ', name: 'Montego Bay', region: 'Jamaica' },
  { code: 'BGO', name: 'Bergen', region: 'Norway' },
  { code: 'TOS', name: 'Tromsø', region: 'Norway' },
  { code: 'RHO', name: 'Rhodes', region: 'Greece' },
];

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>(INITIAL);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleJSONImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        const arr: Destination[] = (Array.isArray(data) ? data : data.destinations || [])
          .map((d: any) => ({
            code: String(d.code || d.iata || '').toUpperCase(),
            name: String(d.name || d.city || ''),
            region: String(d.region || d.country || ''),
          }))
          .filter((d: Destination) => d.code && d.name);

        if (arr.length === 0) {
          toast({ title: 'No destinations found', description: 'JSON must contain objects with "code" and "name" fields.', variant: 'destructive' });
          return;
        }

        setDestinations(arr);
        setLastSync(new Date().toLocaleString());
        toast({ title: 'Import successful', description: `${arr.length} destinations loaded from JSON.` });
      } catch {
        toast({ title: 'Parse error', description: 'Could not parse JSON file. Check format.', variant: 'destructive' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="p-6 max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Destinations</h2>
          <p className="text-xs text-muted-foreground">Imported from travel system as JSON. Read-only view of current destinations.</p>
        </div>
        <div className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleJSONImport} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
            <Upload className="w-3.5 h-3.5" /> Import JSON
          </button>
        </div>
      </div>

      {/* Expected format hint */}
      <div className="p-3 rounded-md bg-secondary/50 space-y-1">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          <AlertCircle className="w-3 h-3" /> Expected JSON format
        </div>
        <pre className="text-[10px] font-mono text-muted-foreground overflow-x-auto">
{`[{ "code": "AYT", "name": "Antalya", "region": "Turkey" }, ...]
// or: { "destinations": [...] }
// Also accepts "iata" for code, "city" for name, "country" for region`}
        </pre>
      </div>

      {lastSync && (
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Globe className="w-3 h-3" /> Last synced: {lastSync}
        </div>
      )}

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="ops-grid-header border-r border-b text-left">Code</th>
              <th className="ops-grid-header border-r border-b text-left">Name</th>
              <th className="ops-grid-header border-b text-left">Region</th>
            </tr>
          </thead>
          <tbody>
            {destinations.map(d => (
              <tr key={d.code} className="hover:bg-grid-hover transition-colors">
                <td className="ops-grid-cell font-mono font-semibold text-foreground">{d.code}</td>
                <td className="ops-grid-cell text-foreground">{d.name}</td>
                <td className="ops-grid-cell text-muted-foreground">{d.region || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-muted-foreground">{destinations.length} destinations loaded</p>
    </div>
  );
}
