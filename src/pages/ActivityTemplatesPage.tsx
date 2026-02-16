import { useState } from 'react';
import { ActivityTemplate, TaskSource, SLAReferenceDate } from '@/types/operations';
import { ACTIVITY_TEMPLATES } from '@/data/mockData';
import { Plus, Trash2, GripVertical, Save, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const SOURCES: TaskSource[] = ['GLOBAL', 'TG', 'TS', 'TD', 'CUSTOM'];
const REF_DATES: SLAReferenceDate[] = ['departure', 'return', 'ji_exists'];

export default function ActivityTemplatesPage() {
  const [templates, setTemplates] = useState<ActivityTemplate[]>([...ACTIVITY_TEMPLATES]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const addTemplate = () => {
    const newTpl: ActivityTemplate = {
      code: '',
      name: '',
      required: true,
      critical: false,
      slaOffsetDays: 7,
      referenceDate: 'departure',
      source: 'GLOBAL',
    };
    setTemplates(prev => [...prev, newTpl]);
    setEditingIdx(templates.length);
  };

  const updateField = <K extends keyof ActivityTemplate>(idx: number, key: K, value: ActivityTemplate[K]) => {
    setTemplates(prev => prev.map((t, i) => i === idx ? { ...t, [key]: value } : t));
  };

  const removeTemplate = (idx: number) => {
    setTemplates(prev => prev.filter((_, i) => i !== idx));
    setEditingIdx(null);
  };

  const handleSave = () => {
    const invalid = templates.some(t => !t.code.trim() || !t.name.trim());
    if (invalid) {
      toast({ title: 'Validation error', description: 'All templates must have a code and name.', variant: 'destructive' });
      return;
    }
    const codes = templates.map(t => t.code);
    if (new Set(codes).size !== codes.length) {
      toast({ title: 'Duplicate code', description: 'Each activity template must have a unique code.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Saved', description: `${templates.length} activity templates saved.` });
    setEditingIdx(null);
  };

  return (
    <div className="p-6 max-w-5xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Activity Templates</h2>
          <p className="text-xs text-muted-foreground">Define activities tracked for each departure. Changes apply to new departures.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={addTemplate} className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold bg-secondary text-foreground rounded-md hover:bg-accent transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
          <button onClick={handleSave} className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
            <Save className="w-3.5 h-3.5" /> Save
          </button>
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="ops-grid-header border-r border-b text-left w-8"></th>
              <th className="ops-grid-header border-r border-b text-left">Code</th>
              <th className="ops-grid-header border-r border-b text-left">Name</th>
              <th className="ops-grid-header border-r border-b text-center">Source</th>
              <th className="ops-grid-header border-r border-b text-center">SLA Days</th>
              <th className="ops-grid-header border-r border-b text-center">Ref Date</th>
              <th className="ops-grid-header border-r border-b text-center">Required</th>
              <th className="ops-grid-header border-r border-b text-center">Critical</th>
              <th className="ops-grid-header border-b text-center w-10"></th>
            </tr>
          </thead>
          <tbody>
            {templates.map((t, idx) => (
              <tr key={idx} className="hover:bg-grid-hover transition-colors" onClick={() => setEditingIdx(idx)}>
                <td className="ops-grid-cell text-center text-muted-foreground">
                  <GripVertical className="w-3 h-3 inline" />
                </td>
                <td className="ops-grid-cell">
                  <input
                    value={t.code}
                    onChange={e => updateField(idx, 'code', e.target.value.toUpperCase().slice(0, 4))}
                    className="w-16 bg-transparent font-mono font-semibold text-foreground outline-none border-b border-transparent focus:border-primary"
                    maxLength={4}
                    placeholder="XX"
                  />
                </td>
                <td className="ops-grid-cell">
                  <input
                    value={t.name}
                    onChange={e => updateField(idx, 'name', e.target.value)}
                    className="w-full bg-transparent text-foreground outline-none border-b border-transparent focus:border-primary"
                    placeholder="Activity name"
                  />
                </td>
                <td className="ops-grid-cell text-center">
                  <select
                    value={t.source}
                    onChange={e => updateField(idx, 'source', e.target.value as TaskSource)}
                    className="bg-secondary text-foreground text-[10px] rounded px-1 py-0.5 border border-border"
                  >
                    {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="ops-grid-cell text-center">
                  <input
                    type="number"
                    value={t.slaOffsetDays}
                    onChange={e => updateField(idx, 'slaOffsetDays', Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-12 bg-transparent font-mono text-center text-foreground outline-none border-b border-transparent focus:border-primary"
                    min={0}
                  />
                </td>
                <td className="ops-grid-cell text-center">
                  <select
                    value={t.referenceDate}
                    onChange={e => updateField(idx, 'referenceDate', e.target.value as SLAReferenceDate)}
                    className="bg-secondary text-foreground text-[10px] rounded px-1 py-0.5 border border-border"
                  >
                    {REF_DATES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="ops-grid-cell text-center">
                  <input type="checkbox" checked={t.required} onChange={e => updateField(idx, 'required', e.target.checked)} className="w-3 h-3 accent-primary" />
                </td>
                <td className="ops-grid-cell text-center">
                  <div className="flex items-center justify-center gap-1">
                    <input type="checkbox" checked={t.critical} onChange={e => updateField(idx, 'critical', e.target.checked)} className="w-3 h-3 accent-destructive" />
                    {t.critical && <AlertTriangle className="w-3 h-3 text-status-red" />}
                  </div>
                </td>
                <td className="ops-grid-cell text-center">
                  <button onClick={(e) => { e.stopPropagation(); removeTemplate(idx); }} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-muted-foreground">
        {templates.length} templates · {templates.filter(t => t.critical).length} critical · {templates.filter(t => t.required).length} required
      </p>
    </div>
  );
}
