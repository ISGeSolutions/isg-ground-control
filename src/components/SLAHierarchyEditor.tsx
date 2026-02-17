import { useState, useCallback } from 'react';
import { Lock, Save, ChevronDown, Plus, Trash2, CalendarIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { ACTIVITY_TEMPLATES } from '@/data/mockData';
import type { SLAReferenceDate, SLALevel } from '@/types/operations';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type RefDate = SLAReferenceDate;
const REF_DATES: RefDate[] = ['departure', 'return', 'ji_exists'];
const REF_LABELS: Record<RefDate, string> = { departure: 'Departure', return: 'Return', ji_exists: 'JI exists' };

const ACTIVITY_COLS = ACTIVITY_TEMPLATES.map(t => ({ code: t.code, label: t.code }));

// ─── Data types ────────────────────────────────────────────────────────────────

interface SLAEntry {
  refDate: RefDate;
  offsets: Record<string, number | null>;
}

interface HierarchyLevel {
  id: string;
  type: 'global' | 'tour_generic' | 'tour_series' | 'departure';
  label: string;
  tourCode: string;
  seriesName: string;
  parentId: string | null;
  departureDate?: string; // ISO date, only for departure type
  entries: SLAEntry[];
}

function emptyEntries(): SLAEntry[] {
  const codes = ACTIVITY_COLS.map(c => c.code);
  return REF_DATES.map(refDate => ({
    refDate,
    offsets: Object.fromEntries(codes.map(c => [c, null])),
  }));
}

function cloneEntries(entries: SLAEntry[]): SLAEntry[] {
  return entries.map(e => ({ refDate: e.refDate, offsets: { ...e.offsets } }));
}

// Merge: inherited values are used where own is null
function resolveEntries(own: SLAEntry[], inherited: SLAEntry[]): SLAEntry[] {
  return own.map(ownEntry => {
    const inhEntry = inherited.find(e => e.refDate === ownEntry.refDate);
    const merged: Record<string, number | null> = {};
    for (const code of ACTIVITY_COLS.map(c => c.code)) {
      merged[code] = ownEntry.offsets[code] ?? inhEntry?.offsets[code] ?? null;
    }
    return { refDate: ownEntry.refDate, offsets: merged };
  });
}

// ─── Seed data ─────────────────────────────────────────────────────────────────

function buildGlobalOffsets(): Record<string, number | null> {
  const map: Record<string, number | null> = {};
  for (const t of ACTIVITY_TEMPLATES) {
    map[t.code] = null;
  }
  return map;
}

function buildInitialLevels(): HierarchyLevel[] {
  // Build global entries from ACTIVITY_TEMPLATES defaults
  const globalDep: Record<string, number | null> = {};
  const globalRet: Record<string, number | null> = {};
  const globalJi: Record<string, number | null> = {};
  for (const t of ACTIVITY_TEMPLATES) {
    if (t.referenceDate === 'departure') globalDep[t.code] = -t.slaOffsetDays;
    else globalDep[t.code] = null;
    if (t.referenceDate === 'return') globalRet[t.code] = t.slaOffsetDays;
    else globalRet[t.code] = null;
    if (t.referenceDate === 'ji_exists') globalJi[t.code] = t.slaOffsetDays;
    else globalJi[t.code] = null;
  }

  return [
    {
      id: 'global',
      type: 'global',
      label: 'Global',
      tourCode: 'GLOBAL',
      seriesName: 'Global',
      parentId: null,
      entries: [
        { refDate: 'departure', offsets: globalDep },
        { refDate: 'return', offsets: globalRet },
        { refDate: 'ji_exists', offsets: globalJi },
      ],
    },
    {
      id: 'tg_bhu',
      type: 'tour_generic',
      label: 'Tour Generic: BHU',
      tourCode: 'BHU',
      seriesName: 'Tour Generic / Bhutan',
      parentId: 'global',
      entries: emptyEntries(),
    },
    {
      id: 'ts_bhu2026',
      type: 'tour_series',
      label: 'Tour Series: BHU2026',
      tourCode: 'BHU2026',
      seriesName: 'Tour series / Bhutan in 2026',
      parentId: 'tg_bhu',
      entries: emptyEntries(),
    },
  ];
}

// ─── Color helpers ─────────────────────────────────────────────────────────────

function levelColors(type: HierarchyLevel['type']) {
  switch (type) {
    case 'global': return { bg: 'bg-yellow-500/20 border-yellow-500/40', header: 'bg-yellow-500/30' };
    case 'tour_generic': return { bg: 'bg-cyan-500/20 border-cyan-500/40', header: 'bg-cyan-500/30' };
    case 'tour_series': return { bg: 'bg-green-500/20 border-green-500/40', header: 'bg-green-500/30' };
    case 'departure': return { bg: 'bg-pink-500/20 border-pink-500/40', header: 'bg-pink-500/30' };
  }
}

function typeLabel(type: HierarchyLevel['type']) {
  switch (type) {
    case 'global': return 'Global';
    case 'tour_generic': return 'Tour Generic';
    case 'tour_series': return 'Tour Series';
    case 'departure': return 'Departure';
  }
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function SLAHierarchyEditor() {
  const [levels, setLevels] = useState<HierarchyLevel[]>(buildInitialLevels);
  const [expandedLevel, setExpandedLevel] = useState<string>('global');
  const [showReturn, setShowReturn] = useState(false);
  const [showJI, setShowJI] = useState(false);

  const visibleRefDates = ['departure' as RefDate]
    .concat(showReturn ? ['return' as RefDate] : [])
    .concat(showJI ? ['ji_exists' as RefDate] : []);

  // ─── Add level ─────────────────────────────────────────────────────────
  const [addingType, setAddingType] = useState<'tour_generic' | 'tour_series' | 'departure' | null>(null);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newParentId, setNewParentId] = useState('');
  const [newDepDate, setNewDepDate] = useState<Date | undefined>();

  const possibleParents = (type: 'tour_generic' | 'tour_series' | 'departure') => {
    switch (type) {
      case 'tour_generic': return levels.filter(l => l.type === 'global');
      case 'tour_series': return levels.filter(l => l.type === 'tour_generic');
      case 'departure': return levels.filter(l => l.type === 'tour_series');
    }
  };

  const handleAddLevel = () => {
    if (!addingType || !newName.trim() || !newCode.trim() || !newParentId) return;
    if (addingType === 'departure' && !newDepDate) return;

    const id = `${addingType}_${Date.now()}`;
    const parent = levels.find(l => l.id === newParentId);
    const label = addingType === 'departure'
      ? `Dep: ${newDepDate ? format(newDepDate, 'dd MMM yyyy') : ''}`
      : `${typeLabel(addingType)}: ${newCode.toUpperCase()}`;

    const newLevel: HierarchyLevel = {
      id,
      type: addingType,
      label,
      tourCode: newCode.toUpperCase(),
      seriesName: newName,
      parentId: newParentId,
      departureDate: addingType === 'departure' && newDepDate ? format(newDepDate, 'yyyy-MM-dd') : undefined,
      entries: emptyEntries(),
    };

    setLevels(prev => [...prev, newLevel]);
    setExpandedLevel(id);
    setAddingType(null);
    setNewName('');
    setNewCode('');
    setNewParentId('');
    setNewDepDate(undefined);
    toast({ title: 'Level added', description: `${label} created successfully.` });
  };

  // ─── Delete level ──────────────────────────────────────────────────────
  const handleDeleteLevel = (id: string) => {
    // Also delete children
    const toRemove = new Set<string>();
    const collectChildren = (parentId: string) => {
      toRemove.add(parentId);
      levels.filter(l => l.parentId === parentId).forEach(l => collectChildren(l.id));
    };
    collectChildren(id);
    setLevels(prev => prev.filter(l => !toRemove.has(l.id)));
    toast({ title: 'Deleted', description: `Removed level and ${toRemove.size - 1} child level(s).` });
  };

  // ─── Edit cell ─────────────────────────────────────────────────────────
  const updateCell = useCallback((levelId: string, refDate: RefDate, actCode: string, value: number | null) => {
    setLevels(prev => prev.map(l => {
      if (l.id !== levelId) return l;
      return {
        ...l,
        entries: l.entries.map(e => {
          if (e.refDate !== refDate) return e;
          return { ...e, offsets: { ...e.offsets, [actCode]: value } };
        }),
      };
    }));
  }, []);

  // ─── Resolve inherited chain ───────────────────────────────────────────
  const getInheritedEntries = useCallback((level: HierarchyLevel): SLAEntry[] => {
    const chain: HierarchyLevel[] = [];
    let current = level;
    while (current.parentId) {
      const parent = levels.find(l => l.id === current.parentId);
      if (!parent) break;
      chain.unshift(parent);
      current = parent;
    }
    // Merge from root down
    let resolved = emptyEntries();
    for (const ancestor of chain) {
      resolved = resolveEntries(ancestor.entries, resolved);
    }
    return resolved;
  }, [levels]);

  const getInheritedLabel = useCallback((level: HierarchyLevel): string => {
    const chain: string[] = [];
    let current = level;
    while (current.parentId) {
      const parent = levels.find(l => l.id === current.parentId);
      if (!parent) break;
      chain.unshift(parent.type === 'global' ? 'GLOBAL' : parent.seriesName);
      current = parent;
    }
    return chain.join(' + ');
  }, [levels]);

  // Build tree structure for rendering
  const rootLevels = levels.filter(l => l.parentId === null);

  const renderLevel = (level: HierarchyLevel, depth: number = 0) => {
    const children = levels.filter(l => l.parentId === level.id);
    const isExpanded = expandedLevel === level.id;
    const colors = levelColors(level.type);
    const inherited = level.parentId ? getInheritedEntries(level) : [];
    const inheritedLabel = level.parentId ? getInheritedLabel(level) : '';
    const resolvedInherited = resolveEntries(level.entries, inherited);

    return (
      <div key={level.id} className={depth > 0 ? 'ml-4' : ''}>
        <div className={`border rounded-lg overflow-hidden ${colors.bg} mb-3`}>
          {/* Header */}
          <button
            onClick={() => setExpandedLevel(prev => prev === level.id ? '' : level.id)}
            className={`w-full flex items-center justify-between px-3 py-2 ${colors.header} transition-colors hover:opacity-90`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">{level.label}</span>
              {level.departureDate && (
                <span className="text-[10px] text-muted-foreground font-mono">({level.departureDate})</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {level.type !== 'global' && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      onClick={e => e.stopPropagation()}
                      className="h-6 w-6 flex items-center justify-center text-destructive hover:bg-destructive/10 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {level.label}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will also delete all child levels. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteLevel(level.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <button
                onClick={e => { e.stopPropagation(); toast({ title: 'Saved', description: `${level.label} SLA rules saved.` }); }}
                className="h-6 px-2 text-[10px] font-semibold bg-primary text-primary-foreground rounded hover:opacity-90"
              >
                <Save className="w-3 h-3" />
              </button>
              <ChevronDown className={`w-4 h-4 text-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {isExpanded && (
            <div className="p-3 space-y-3">
              {/* Inherited (LOCKED) */}
              {inheritedLabel && inherited.length > 0 && (
                <SLATable
                  label={inheritedLabel}
                  tourCode={level.tourCode}
                  entries={resolveEntries(emptyEntries(), inherited)}
                  locked
                  activityCols={ACTIVITY_COLS}
                  visibleRefDates={visibleRefDates}
                />
              )}

              {/* Own editable */}
              <SLATable
                label={level.seriesName}
                tourCode={level.tourCode}
                entries={level.entries}
                locked={false}
                activityCols={ACTIVITY_COLS}
                inheritedEntries={inherited}
                levelId={level.id}
                onCellChange={updateCell}
                visibleRefDates={visibleRefDates}
              />
            </div>
          )}
        </div>

        {/* Children */}
        {children.map(child => renderLevel(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">SLA Hierarchy Configuration</h3>
          <p className="text-[10px] text-muted-foreground mt-1">
            SLA offsets cascade: <strong>Global → Tour Generic → Tour Series → Departure</strong>.
            The most specific level wins. Inherited values are <span className="inline-flex items-center gap-0.5"><Lock className="w-2.5 h-2.5" /> LOCKED</span>.
            Overridden values are <span className="font-bold">highlighted</span>.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground cursor-pointer">
            <Switch checked={showReturn} onCheckedChange={setShowReturn} className="scale-75" />
            Return dates
          </label>
          <label className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground cursor-pointer">
            <Switch checked={showJI} onCheckedChange={setShowJI} className="scale-75" />
            JI dates
          </label>
        </div>
      </div>

      {/* Add new level controls */}
      <div className="border border-dashed border-border rounded-lg p-3 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">Add level:</span>
          {(['tour_generic', 'tour_series', 'departure'] as const).map(type => (
            <button
              key={type}
              onClick={() => {
                setAddingType(type);
                const parents = possibleParents(type);
                if (parents.length === 1) setNewParentId(parents[0].id);
              }}
              className={`h-7 px-3 text-[10px] font-semibold rounded-md transition-colors ${
                addingType === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground hover:bg-accent'
              }`}
            >
              <Plus className="w-3 h-3 inline mr-1" />
              {typeLabel(type)}
            </button>
          ))}
        </div>

        {addingType && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-[9px] font-semibold text-muted-foreground uppercase">Name</label>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder={`e.g. ${addingType === 'tour_generic' ? 'Bhutan' : addingType === 'tour_series' ? 'Bhutan 2026' : 'Oct departure'}`}
                className="w-full h-7 px-2 text-xs bg-secondary border border-border rounded-md text-foreground"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-semibold text-muted-foreground uppercase">Code</label>
              <input
                value={newCode}
                onChange={e => setNewCode(e.target.value)}
                placeholder="e.g. BHU"
                className="w-full h-7 px-2 text-xs font-mono bg-secondary border border-border rounded-md text-foreground uppercase"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-semibold text-muted-foreground uppercase">Parent level</label>
              <Select value={newParentId} onValueChange={setNewParentId}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Select parent..." />
                </SelectTrigger>
                <SelectContent>
                  {possibleParents(addingType).map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {addingType === 'departure' && (
              <div className="space-y-1">
                <label className="text-[9px] font-semibold text-muted-foreground uppercase">Departure date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('h-7 w-full justify-start text-xs font-normal', !newDepDate && 'text-muted-foreground')}>
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {newDepDate ? format(newDepDate, 'dd MMM yyyy') : 'Pick date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={newDepDate} onSelect={setNewDepDate} initialFocus className={cn('p-3 pointer-events-auto')} />
                  </PopoverContent>
                </Popover>
              </div>
            )}
            <div className="col-span-2 flex gap-2">
              <button
                onClick={handleAddLevel}
                disabled={!newName.trim() || !newCode.trim() || !newParentId || (addingType === 'departure' && !newDepDate)}
                className="h-7 px-4 text-[10px] font-semibold bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                Create
              </button>
              <button
                onClick={() => { setAddingType(null); setNewName(''); setNewCode(''); setNewParentId(''); setNewDepDate(undefined); }}
                className="h-7 px-3 text-[10px] font-semibold bg-secondary text-foreground rounded-md hover:bg-accent"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tree */}
      {rootLevels.map(level => renderLevel(level))}
    </div>
  );
}

// ─── SLA Table ─────────────────────────────────────────────────────────────────

interface SLATableProps {
  label: string;
  tourCode: string;
  entries: SLAEntry[];
  locked: boolean;
  activityCols: { code: string; label: string }[];
  inheritedEntries?: SLAEntry[];
  levelId?: string;
  onCellChange?: (levelId: string, refDate: RefDate, actCode: string, value: number | null) => void;
  visibleRefDates?: RefDate[];
}

function isOverridden(own: number | null, inherited: number | null): boolean {
  if (own === null && inherited === null) return false;
  return own !== inherited;
}

function SLATable({ label, tourCode, entries, locked, activityCols, inheritedEntries, levelId, onCellChange, visibleRefDates }: SLATableProps) {
  const colTemplate = `180px 80px 80px repeat(${activityCols.length}, 56px)`;
  const filteredEntries = visibleRefDates ? entries.filter(e => visibleRefDates.includes(e.refDate)) : entries;

  return (
    <div className={`rounded border ${locked ? 'border-muted bg-muted/30' : 'border-border bg-background/50'}`}>
      {/* Header */}
      <div className="grid gap-0" style={{ gridTemplateColumns: colTemplate }}>
        <div className="px-2 py-1.5 text-[9px] font-semibold text-muted-foreground uppercase border-b border-border">Tour series name</div>
        <div className="px-2 py-1.5 text-[9px] font-semibold text-muted-foreground uppercase border-b border-border">Tour code</div>
        <div className="px-2 py-1.5 text-[9px] font-semibold text-muted-foreground uppercase border-b border-border">Ref from</div>
        {activityCols.map(col => (
          <div key={col.code} className="px-1 py-1.5 text-[9px] font-semibold text-muted-foreground text-center border-b border-border">{col.label}</div>
        ))}
      </div>

      {/* Rows */}
      {filteredEntries.map((entry, idx) => {
        const inheritedEntry = inheritedEntries?.find(e => e.refDate === entry.refDate);

        return (
          <div key={entry.refDate} className="grid gap-0 items-center border-b border-border/50 last:border-b-0" style={{ gridTemplateColumns: colTemplate }}>
            <div className="px-2 py-1 text-[10px] font-medium text-foreground truncate flex items-center gap-1">
              {idx === 0 && locked && <Lock className="w-3 h-3 text-muted-foreground shrink-0" />}
              {idx === 0 ? label : ''}
            </div>
            <div className="px-2 py-1 text-[10px] font-mono text-foreground">{idx === 0 ? tourCode : ''}</div>
            <div className="px-2 py-1 text-[10px] text-muted-foreground">{REF_LABELS[entry.refDate]}</div>

            {activityCols.map(col => {
              const val = entry.offsets[col.code];
              const inhVal = inheritedEntry?.offsets[col.code] ?? null;
              const overridden = !locked && inheritedEntries && isOverridden(val, inhVal);

              if (locked) {
                return (
                  <div key={col.code} className="px-1 py-1 text-center text-[10px] font-mono text-muted-foreground bg-muted/40">
                    {val !== null ? val : ''}
                  </div>
                );
              }

              return (
                <div key={col.code} className="px-0.5 py-0.5">
                  <input
                    type="number"
                    value={val ?? ''}
                    onChange={e => {
                      if (!levelId || !onCellChange) return;
                      const raw = e.target.value;
                      onCellChange(levelId, entry.refDate, col.code, raw === '' ? null : parseInt(raw, 10));
                    }}
                    className={cn(
                      'w-full h-6 px-1 text-center text-[10px] font-mono rounded border bg-background text-foreground',
                      overridden ? 'border-primary/50 bg-accent/20 font-bold' : 'border-border',
                    )}
                    placeholder={inhVal !== null ? String(inhVal) : '–'}
                  />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
