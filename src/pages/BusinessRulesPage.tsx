import { useState } from 'react';
import { Save, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import SLAHierarchyEditor from '@/components/SLAHierarchyEditor';

interface BusinessRulesConfig {
  overdueCriticalDays: number;
  overdueWarningDays: number;
  readinessMethod: 'required_only' | 'all_activities';
  riskRedThreshold: string;
  riskAmberThreshold: string;
  riskGreenThreshold: string;
  heatmapRedMax: number;
  heatmapAmberMax: number;
  autoMarkOverdue: boolean;
  includeNAInReadiness: boolean;
}

const DEFAULT_RULES: BusinessRulesConfig = {
  overdueCriticalDays: 3,
  overdueWarningDays: 7,
  readinessMethod: 'required_only',
  riskRedThreshold: 'critical_overdue',
  riskAmberThreshold: 'any_overdue',
  riskGreenThreshold: 'no_overdue',
  heatmapRedMax: 39,
  heatmapAmberMax: 79,
  autoMarkOverdue: true,
  includeNAInReadiness: false,
};

export default function BusinessRulesPage() {
  const [rules, setRules] = useState<BusinessRulesConfig>(DEFAULT_RULES);

  const update = <K extends keyof BusinessRulesConfig>(key: K, value: BusinessRulesConfig[K]) => {
    setRules(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (rules.heatmapRedMax >= rules.heatmapAmberMax) {
      toast({ title: 'Validation error', description: 'Heatmap red threshold must be less than amber threshold.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Rules saved', description: 'Business rules updated successfully.' });
  };

  const handleReset = () => {
    setRules(DEFAULT_RULES);
    toast({ title: 'Reset', description: 'Business rules reset to defaults.' });
  };

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Business Rules</h2>
          <p className="text-xs text-muted-foreground">Configure thresholds, readiness calculation, and risk colour breakpoints.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleReset} className="h-8 px-3 text-xs font-semibold bg-secondary text-foreground rounded-md hover:bg-accent transition-colors">
            Reset Defaults
          </button>
          <button onClick={handleSave} className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
            <Save className="w-3.5 h-3.5" /> Save
          </button>
        </div>
      </div>

      {/* Overdue Thresholds */}
      <section className="border border-border rounded-lg p-4 space-y-3">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Overdue Thresholds</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Critical (Red) — days before departure</label>
            <input
              type="number"
              value={rules.overdueCriticalDays}
              onChange={e => update('overdueCriticalDays', Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full h-8 px-2 text-xs font-mono bg-secondary border border-border rounded-md text-foreground"
              min={0}
            />
            <p className="text-[9px] text-muted-foreground">Items due within this many days show as critical</p>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Warning (Amber) — days before departure</label>
            <input
              type="number"
              value={rules.overdueWarningDays}
              onChange={e => update('overdueWarningDays', Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full h-8 px-2 text-xs font-mono bg-secondary border border-border rounded-md text-foreground"
              min={0}
            />
            <p className="text-[9px] text-muted-foreground">Items due within this many days show as warning</p>
          </div>
        </div>
      </section>

      {/* Readiness Calculation */}
      <section className="border border-border rounded-lg p-4 space-y-3">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Readiness Calculation</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-2 rounded-md hover:bg-grid-hover cursor-pointer transition-colors">
            <input
              type="radio"
              name="readinessMethod"
              checked={rules.readinessMethod === 'required_only'}
              onChange={() => update('readinessMethod', 'required_only')}
              className="accent-primary"
            />
            <div>
              <span className="text-xs font-semibold text-foreground">Required activities only</span>
              <p className="text-[10px] text-muted-foreground">Readiness = Completed Required / Total Required</p>
            </div>
          </label>
          <label className="flex items-center gap-3 p-2 rounded-md hover:bg-grid-hover cursor-pointer transition-colors">
            <input
              type="radio"
              name="readinessMethod"
              checked={rules.readinessMethod === 'all_activities'}
              onChange={() => update('readinessMethod', 'all_activities')}
              className="accent-primary"
            />
            <div>
              <span className="text-xs font-semibold text-foreground">All activities</span>
              <p className="text-[10px] text-muted-foreground">Readiness = Completed All / Total All (excl. N/A)</p>
            </div>
          </label>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-xs font-semibold text-foreground">Include N/A in readiness</span>
            <p className="text-[10px] text-muted-foreground">Count N/A activities as "complete" in the calculation</p>
          </div>
          <Switch checked={rules.includeNAInReadiness} onCheckedChange={v => update('includeNAInReadiness', v)} />
        </div>
      </section>

      {/* Risk Colour Rules */}
      <section className="border border-border rounded-lg p-4 space-y-3">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Risk Colour Rules</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-status-red shrink-0" />
            <span className="text-xs text-foreground flex-1">Red — Critical activity overdue</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-status-amber shrink-0" />
            <span className="text-xs text-foreground flex-1">Amber — Any activity overdue</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-status-green shrink-0" />
            <span className="text-xs text-foreground flex-1">Green — No overdue activities</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground pt-1">
          <Info className="w-3 h-3 shrink-0" />
          Risk rules are currently fixed to the hierarchy logic. Future: configurable per-rule thresholds.
        </div>
      </section>

      {/* Heatmap Breakpoints */}
      <section className="border border-border rounded-lg p-4 space-y-3">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Heatmap Readiness Breakpoints</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-status-red shrink-0" />
              <label className="text-[10px] font-semibold text-muted-foreground">Red: 0% –</label>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={rules.heatmapRedMax}
                onChange={e => update('heatmapRedMax', Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                className="w-16 h-7 px-2 text-xs font-mono bg-secondary border border-border rounded-md text-foreground"
                min={0} max={100}
              />
              <span className="text-[10px] text-muted-foreground">%</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-status-amber shrink-0" />
              <label className="text-[10px] font-semibold text-muted-foreground">Amber: {rules.heatmapRedMax + 1}% –</label>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={rules.heatmapAmberMax}
                onChange={e => update('heatmapAmberMax', Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                className="w-16 h-7 px-2 text-xs font-mono bg-secondary border border-border rounded-md text-foreground"
                min={0} max={100}
              />
              <span className="text-[10px] text-muted-foreground">%</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-status-green shrink-0" />
              <label className="text-[10px] font-semibold text-muted-foreground">Green: {rules.heatmapAmberMax + 1}% – 100%</label>
            </div>
            <p className="text-[9px] text-muted-foreground pt-1.5">Auto-calculated</p>
          </div>
        </div>
      </section>

      {/* Auto-mark overdue */}
      <section className="border border-border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-foreground">Auto-mark Overdue</h3>
            <p className="text-[10px] text-muted-foreground">Automatically set activities to "Overdue" when past their SLA due date</p>
          </div>
          <Switch checked={rules.autoMarkOverdue} onCheckedChange={v => update('autoMarkOverdue', v)} />
        </div>
      </section>

      {/* SLA Hierarchy */}
      <section className="border border-border rounded-lg p-4">
        <SLAHierarchyEditor />
      </section>
    </div>
  );
}
