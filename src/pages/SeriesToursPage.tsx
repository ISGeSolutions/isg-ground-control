import { useState, useRef } from 'react';
import { Series } from '@/types/operations';
import { SERIES } from '@/data/mockData';
import { Upload, Download, Trash2, Plus, Save, FileSpreadsheet } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SeriesExtended extends Series {
  destination?: string;
  paxMin?: number;
  paxMax?: number;
  season?: string;
}

const toExtended = (s: Series): SeriesExtended => ({ ...s, destination: '', paxMin: 10, paxMax: 200, season: '' });

export default function SeriesToursPage() {
  const [series, setSeries] = useState<SeriesExtended[]>(SERIES.map(toExtended));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) { toast({ title: 'Invalid CSV', description: 'File must have a header row and at least one data row.', variant: 'destructive' }); return; }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const codeIdx = headers.indexOf('code');
        const nameIdx = headers.indexOf('name');
        if (codeIdx === -1 || nameIdx === -1) { toast({ title: 'Missing columns', description: 'CSV must include "code" and "name" columns.', variant: 'destructive' }); return; }

        const destIdx = headers.indexOf('destination');
        const paxMinIdx = headers.indexOf('paxmin');
        const paxMaxIdx = headers.indexOf('paxmax');
        const seasonIdx = headers.indexOf('season');

        const imported: SeriesExtended[] = lines.slice(1).map((line, i) => {
          const cols = line.split(',').map(c => c.trim());
          return {
            id: `csv-${i}-${Date.now()}`,
            code: cols[codeIdx] || '',
            name: cols[nameIdx] || '',
            destination: destIdx >= 0 ? cols[destIdx] : '',
            paxMin: paxMinIdx >= 0 ? parseInt(cols[paxMinIdx]) || 10 : 10,
            paxMax: paxMaxIdx >= 0 ? parseInt(cols[paxMaxIdx]) || 200 : 200,
            season: seasonIdx >= 0 ? cols[seasonIdx] : '',
          };
        }).filter(s => s.code && s.name);

        setSeries(imported);
        toast({ title: 'Import successful', description: `${imported.length} series imported from CSV.` });
      } catch {
        toast({ title: 'Parse error', description: 'Could not parse the CSV file.', variant: 'destructive' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const exportCSV = () => {
    const header = 'code,name,destination,paxMin,paxMax,season';
    const rows = series.map(s => `${s.code},${s.name},${s.destination || ''},${s.paxMin || ''},${s.paxMax || ''},${s.season || ''}`);
    const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'series.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const addSeries = () => {
    setSeries(prev => [...prev, { id: `new-${Date.now()}`, code: '', name: '', destination: '', paxMin: 10, paxMax: 200, season: '' }]);
  };

  const updateField = <K extends keyof SeriesExtended>(idx: number, key: K, value: SeriesExtended[K]) => {
    setSeries(prev => prev.map((s, i) => i === idx ? { ...s, [key]: value } : s));
  };

  const removeSeries = (idx: number) => {
    setSeries(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="p-6 max-w-5xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Series / Tours</h2>
          <p className="text-xs text-muted-foreground">Import tour series from CSV or manage manually.</p>
        </div>
        <div className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleCSVImport} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold bg-secondary text-foreground rounded-md hover:bg-accent transition-colors">
            <Upload className="w-3.5 h-3.5" /> Import CSV
          </button>
          <button onClick={exportCSV} className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold bg-secondary text-foreground rounded-md hover:bg-accent transition-colors">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button onClick={addSeries} className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </div>

      {/* CSV format hint */}
      <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/50 text-[10px] text-muted-foreground">
        <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
        Expected CSV columns: <code className="font-mono bg-secondary px-1 rounded">code, name, destination, paxMin, paxMax, season</code>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="ops-grid-header border-r border-b text-left">Code</th>
              <th className="ops-grid-header border-r border-b text-left">Name</th>
              <th className="ops-grid-header border-r border-b text-left">Destination</th>
              <th className="ops-grid-header border-r border-b text-center">Pax Min</th>
              <th className="ops-grid-header border-r border-b text-center">Pax Max</th>
              <th className="ops-grid-header border-r border-b text-left">Season</th>
              <th className="ops-grid-header border-b text-center w-10"></th>
            </tr>
          </thead>
          <tbody>
            {series.map((s, idx) => (
              <tr key={s.id} className="hover:bg-grid-hover transition-colors">
                <td className="ops-grid-cell">
                  <input value={s.code} onChange={e => updateField(idx, 'code', e.target.value.toUpperCase())} className="w-16 bg-transparent font-mono font-semibold text-foreground outline-none border-b border-transparent focus:border-primary" placeholder="XX24" />
                </td>
                <td className="ops-grid-cell">
                  <input value={s.name} onChange={e => updateField(idx, 'name', e.target.value)} className="w-full bg-transparent text-foreground outline-none border-b border-transparent focus:border-primary" placeholder="Series name" />
                </td>
                <td className="ops-grid-cell">
                  <input value={s.destination || ''} onChange={e => updateField(idx, 'destination', e.target.value)} className="w-full bg-transparent text-muted-foreground outline-none border-b border-transparent focus:border-primary" placeholder="Default destination" />
                </td>
                <td className="ops-grid-cell text-center">
                  <input type="number" value={s.paxMin || ''} onChange={e => updateField(idx, 'paxMin', parseInt(e.target.value) || 0)} className="w-14 bg-transparent font-mono text-center text-foreground outline-none border-b border-transparent focus:border-primary" min={0} />
                </td>
                <td className="ops-grid-cell text-center">
                  <input type="number" value={s.paxMax || ''} onChange={e => updateField(idx, 'paxMax', parseInt(e.target.value) || 0)} className="w-14 bg-transparent font-mono text-center text-foreground outline-none border-b border-transparent focus:border-primary" min={0} />
                </td>
                <td className="ops-grid-cell">
                  <input value={s.season || ''} onChange={e => updateField(idx, 'season', e.target.value)} className="w-full bg-transparent text-muted-foreground outline-none border-b border-transparent focus:border-primary" placeholder="e.g. Summer 2024" />
                </td>
                <td className="ops-grid-cell text-center">
                  <button onClick={() => removeSeries(idx)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-muted-foreground">{series.length} series defined</p>
    </div>
  );
}
