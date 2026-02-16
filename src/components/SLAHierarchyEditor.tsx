import { useState, useMemo } from 'react';
import { Lock, Save, ChevronDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ACTIVITY_TEMPLATES, GLOBAL_SLA_RULES, SERIES_SLA_OVERRIDES, SERIES } from '@/data/mockData';
import type { SLARule, SLAReferenceDate, SLALevel } from '@/types/operations';

type RefDate = SLAReferenceDate;
const REF_DATES: RefDate[] = ['departure', 'return', 'ji_exists'];
const REF_LABELS: Record<RefDate, string> = { departure: 'Departure', return: 'Return', ji_exists: 'JI exists' };

// Demo hierarchy levels
const HIERARCHY_LEVELS = [
  { key: 'global', label: 'Global', level: 'global' as SLALevel, tourCode: 'GLOBAL', seriesName: 'Global' },
  { key: 'tg_bhu', label: 'Tour Generic: BHU', level: 'tour_generic' as SLALevel, tourCode: 'BHU', seriesName: 'Tour Generic / Bhutan' },
  { key: 'ts_bhu2026', label: 'Tour Series: BHU2026', level: 'tour_series' as SLALevel, tourCode: 'BHU2026', seriesName: 'Tour series / Bhutan in 2026' },
  { key: 'dep_25oct', label: 'Tour Series: BHU2026 Dep: 25 Oct 2026', level: 'departure' as SLALevel, tourCode: 'BHU2026', seriesName: 'Tour series / Bhutan in 2026' },
] as const;

// Activity columns (J1..J5, J99 in the spreadsheet — mapped to our activity codes)
const ACTIVITY_COLS = ACTIVITY_TEMPLATES.slice(0, 5).map(t => ({ code: t.code, label: t.code }));

interface SLAEntry {
  refDate: RefDate;
  offsets: Record<string, number | null>; // activityCode → offsetDays or null
}

interface LevelData {
  own: SLAEntry[];
  inherited: SLAEntry[];
}

// Build demo data mirroring the spreadsheet
function buildDemoData(): Record<string, LevelData> {
  const codes = ACTIVITY_COLS.map(c => c.code);

  const globalOwn: SLAEntry[] = [
    { refDate: 'departure', offsets: { [codes[0]]: -10, [codes[1]]: -15, [codes[2]]: -45, [codes[3]]: null, [codes[4]]: null } },
    { refDate: 'return', offsets: { [codes[0]]: null, [codes[1]]: null, [codes[2]]: null, [codes[3]]: 7, [codes[4]]: null } },
    { refDate: 'ji_exists', offsets: { [codes[0]]: null, [codes[1]]: null, [codes[2]]: null, [codes[3]]: null, [codes[4]]: 1 } },
  ];

  const tgOwn: SLAEntry[] = [
    { refDate: 'departure', offsets: { [codes[0]]: -20, [codes[1]]: -15, [codes[2]]: -45, [codes[3]]: null, [codes[4]]: null } },
    { refDate: 'return', offsets: { [codes[0]]: null, [codes[1]]: null, [codes[2]]: null, [codes[3]]: 2, [codes[4]]: null } },
    { refDate: 'ji_exists', offsets: { [codes[0]]: null, [codes[1]]: null, [codes[2]]: null, [codes[3]]: null, [codes[4]]: 1 } },
  ];

  const tsOwn: SLAEntry[] = [
    { refDate: 'departure', offsets: { [codes[0]]: -20, [codes[1]]: -10, [codes[2]]: -45, [codes[3]]: null, [codes[4]]: null } },
    { refDate: 'return', offsets: { [codes[0]]: null, [codes[1]]: null, [codes[2]]: null, [codes[3]]: 5, [codes[4]]: null } },
    { refDate: 'ji_exists', offsets: { [codes[0]]: null, [codes[1]]: null, [codes[2]]: null, [codes[3]]: null, [codes[4]]: 1 } },
  ];

  const depOwn: SLAEntry[] = [
    { refDate: 'departure', offsets: { [codes[0]]: -20, [codes[1]]: -10, [codes[2]]: -60, [codes[3]]: null, [codes[4]]: null } },
    { refDate: 'return', offsets: { [codes[0]]: null, [codes[1]]: null, [codes[2]]: null, [codes[3]]: 5, [codes[4]]: null } },
    { refDate: 'ji_exists', offsets: { [codes[0]]: null, [codes[1]]: null, [codes[2]]: null, [codes[3]]: null, [codes[4]]: 1 } },
  ];

  return {
    global: { own: globalOwn, inherited: [] },
    tg_bhu: { own: tgOwn, inherited: globalOwn },
    ts_bhu2026: { own: tsOwn, inherited: tgOwn },
    dep_25oct: { own: depOwn, inherited: tsOwn },
  };
}

// Check if a value differs from inherited
function isOverridden(own: number | null, inherited: number | null): boolean {
  if (own === null && inherited === null) return false;
  return own !== inherited;
}

export default function SLAHierarchyEditor() {
  const [expandedLevel, setExpandedLevel] = useState<string>('global');
  const data = useMemo(() => buildDemoData(), []);

  const toggleLevel = (key: string) => {
    setExpandedLevel(prev => prev === key ? '' : key);
  };

  const inheritedLabel = (levelKey: string): string => {
    switch (levelKey) {
      case 'tg_bhu': return 'GLOBAL';
      case 'ts_bhu2026': return 'GLOBAL + Tour Generic / Bhutan';
      case 'dep_25oct': return 'GLOBAL + Tour Generic + Tour Series';
      default: return '';
    }
  };

  const levelColor = (levelKey: string): string => {
    switch (levelKey) {
      case 'global': return 'bg-yellow-500/20 border-yellow-500/40';
      case 'tg_bhu': return 'bg-cyan-500/20 border-cyan-500/40';
      case 'ts_bhu2026': return 'bg-green-500/20 border-green-500/40';
      case 'dep_25oct': return 'bg-pink-500/20 border-pink-500/40';
      default: return 'bg-muted border-border';
    }
  };

  const headerColor = (levelKey: string): string => {
    switch (levelKey) {
      case 'global': return 'bg-yellow-500/30';
      case 'tg_bhu': return 'bg-cyan-500/30';
      case 'ts_bhu2026': return 'bg-green-500/30';
      case 'dep_25oct': return 'bg-pink-500/30';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">SLA Hierarchy Configuration</h3>
        <p className="text-[10px] text-muted-foreground mt-1">
          SLA offsets cascade: <strong>Global → Tour Generic → Tour Series → Departure</strong>. 
          The most specific level wins. Inherited values are shown as <span className="inline-flex items-center gap-0.5"><Lock className="w-2.5 h-2.5" /> LOCKED</span>. 
          Overridden values are <span className="text-amber-500 font-semibold">highlighted</span>.
        </p>
      </div>

      {HIERARCHY_LEVELS.map(level => {
        const levelData = data[level.key];
        const isExpanded = expandedLevel === level.key;
        const inherited = inheritedLabel(level.key);

        return (
          <div key={level.key} className={`border rounded-lg overflow-hidden ${levelColor(level.key)}`}>
            {/* Header */}
            <button
              onClick={() => toggleLevel(level.key)}
              className={`w-full flex items-center justify-between px-3 py-2 ${headerColor(level.key)} transition-colors hover:opacity-90`}
            >
              <span className="text-xs font-bold text-foreground">{level.label}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); toast({ title: 'Saved', description: `${level.label} SLA rules saved.` }); }}
                  className="h-6 px-2 text-[10px] font-semibold bg-primary text-primary-foreground rounded hover:opacity-90"
                >
                  <Save className="w-3 h-3" />
                </button>
                <ChevronDown className={`w-4 h-4 text-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {isExpanded && (
              <div className="p-3 space-y-3">
                {/* Inherited (LOCKED) section */}
                {inherited && levelData.inherited.length > 0 && (
                  <div className="space-y-1">
                    <SLATable
                      label={inherited}
                      tourCode={level.tourCode}
                      entries={levelData.inherited}
                      locked
                      activityCols={ACTIVITY_COLS}
                    />
                  </div>
                )}

                {/* Own overrides */}
                <SLATable
                  label={level.seriesName}
                  tourCode={level.tourCode}
                  entries={levelData.own}
                  locked={false}
                  activityCols={ACTIVITY_COLS}
                  inheritedEntries={levelData.inherited}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface SLATableProps {
  label: string;
  tourCode: string;
  entries: SLAEntry[];
  locked: boolean;
  activityCols: { code: string; label: string }[];
  inheritedEntries?: SLAEntry[];
}

function SLATable({ label, tourCode, entries, locked, activityCols, inheritedEntries }: SLATableProps) {
  return (
    <div className={`rounded border ${locked ? 'border-muted bg-muted/30' : 'border-border bg-background/50'}`}>
      {/* Table header */}
      <div className="grid gap-0" style={{ gridTemplateColumns: `180px 80px 80px repeat(${activityCols.length}, 48px)` }}>
        <div className="px-2 py-1.5 text-[9px] font-semibold text-muted-foreground uppercase border-b border-border">
          Tour series name
        </div>
        <div className="px-2 py-1.5 text-[9px] font-semibold text-muted-foreground uppercase border-b border-border">
          Tour code
        </div>
        <div className="px-2 py-1.5 text-[9px] font-semibold text-muted-foreground uppercase border-b border-border">
          Ref from
        </div>
        {activityCols.map(col => (
          <div key={col.code} className="px-1 py-1.5 text-[9px] font-semibold text-muted-foreground text-center border-b border-border">
            {col.label}
          </div>
        ))}
        {locked && (
          <div className="absolute right-0" />
        )}
      </div>

      {/* Rows grouped by ref date */}
      {entries.map((entry, idx) => {
        const inheritedEntry = inheritedEntries?.find(e => e.refDate === entry.refDate);

        return (
          <div
            key={entry.refDate}
            className="grid gap-0 items-center border-b border-border/50 last:border-b-0"
            style={{ gridTemplateColumns: `180px 80px 80px repeat(${activityCols.length}, 48px)` }}
          >
            <div className="px-2 py-1 text-[10px] font-medium text-foreground truncate flex items-center gap-1">
              {idx === 0 && locked && <Lock className="w-3 h-3 text-muted-foreground shrink-0" />}
              {idx === 0 ? label : ''}
            </div>
            <div className="px-2 py-1 text-[10px] font-mono text-foreground">
              {idx === 0 ? tourCode : ''}
            </div>
            <div className="px-2 py-1 text-[10px] text-muted-foreground">
              {REF_LABELS[entry.refDate]}
            </div>
            {activityCols.map(col => {
              const val = entry.offsets[col.code];
              const inhVal = inheritedEntry?.offsets[col.code] ?? null;
              const overridden = !locked && inheritedEntries && isOverridden(val, inhVal);

              return (
                <div
                  key={col.code}
                  className={`px-1 py-1 text-center text-[10px] font-mono ${
                    locked
                      ? 'text-muted-foreground bg-muted/40'
                      : overridden
                        ? 'font-bold bg-accent/30 text-foreground'
                        : 'text-foreground'
                  }`}
                >
                  {val !== null ? val : ''}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
