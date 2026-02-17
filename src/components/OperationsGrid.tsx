import { useState, useMemo } from 'react';
import { Departure } from '@/types/operations';
import { ACTIVITY_TEMPLATES } from '@/data/mockData';
import { ShieldCheck } from 'lucide-react';
import { calculateReadiness, calculateRisk, getDaysUntilDeparture } from '@/utils/operations';
import { ActivityCell } from './ActivityCell';
import { RiskIndicator, ReadinessBar } from './StatusBadge';
import { format } from 'date-fns';
import { GridDensity } from '@/contexts/PreferencesContext';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

type SortKey = 'date' | 'series' | 'days' | 'pax' | 'readiness' | 'risk' | 'destination';
type SortDir = 'asc' | 'desc';

const RISK_ORDER = { red: 0, amber: 1, green: 2 } as const;

interface OperationsGridProps {
  departures: Departure[];
  onCellClick: (departureId: string, activityCode: string) => void;
  onRowClick: (departureId: string) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  density?: GridDensity;
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDown className="w-2.5 h-2.5 opacity-30" />;
  return dir === 'asc' ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />;
}

export function OperationsGrid({ departures, onCellClick, onRowClick, selectedIds, onToggleSelect, density = 'default' }: OperationsGridProps) {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = useMemo(() => {
    const arr = [...departures];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'date': cmp = a.date.localeCompare(b.date); break;
        case 'series': cmp = a.series.localeCompare(b.series); break;
        case 'days': cmp = getDaysUntilDeparture(a.date) - getDaysUntilDeparture(b.date); break;
        case 'pax': cmp = a.paxCount - b.paxCount; break;
        case 'readiness': cmp = calculateReadiness(a.activities) - calculateReadiness(b.activities); break;
        case 'risk': cmp = RISK_ORDER[calculateRisk(a.activities)] - RISK_ORDER[calculateRisk(b.activities)]; break;
        case 'destination': cmp = a.destination.localeCompare(b.destination); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [departures, sortKey, sortDir]);

  const thClass = "ops-grid-header border-r border-b cursor-pointer select-none hover:bg-accent/20 transition-colors";

  return (
    <div className="overflow-auto border border-border rounded-lg" data-density={density}>
      <table className="w-full border-collapse min-w-[1100px]">
        <thead className="sticky top-0 z-10">
          <tr>
            <th className="ops-grid-header w-8 border-r border-b text-center">
              <input type="checkbox" className="w-3 h-3 accent-primary" onChange={() => {}} />
            </th>
            <th className={`${thClass} text-left`} onClick={() => toggleSort('date')}>
              <span className="inline-flex items-center gap-1">DepDate <SortIcon active={sortKey === 'date'} dir={sortDir} /></span>
            </th>
            <th className={`${thClass} text-left`} onClick={() => toggleSort('series')}>
              <span className="inline-flex items-center gap-1">Series <SortIcon active={sortKey === 'series'} dir={sortDir} /></span>
            </th>
            <th className={`${thClass} text-center`} onClick={() => toggleSort('days')}>
              <span className="inline-flex items-center gap-1">Days <SortIcon active={sortKey === 'days'} dir={sortDir} /></span>
            </th>
            <th className={`${thClass} text-center`} onClick={() => toggleSort('pax')}>
              <span className="inline-flex items-center gap-1">Pax <SortIcon active={sortKey === 'pax'} dir={sortDir} /></span>
            </th>
            <th className="ops-grid-header border-r border-b text-center">Mgr</th>
            <th className="ops-grid-header border-r border-b text-center">Exec</th>
            <th className={`${thClass} text-center`} onClick={() => toggleSort('readiness')}>
              <span className="inline-flex items-center gap-1">Ready <SortIcon active={sortKey === 'readiness'} dir={sortDir} /></span>
            </th>
            <th className={`${thClass} text-center w-8`} onClick={() => toggleSort('risk')}>
              <span className="inline-flex items-center gap-1">Risk <SortIcon active={sortKey === 'risk'} dir={sortDir} /></span>
            </th>
            {ACTIVITY_TEMPLATES.map(t => (
              <th
                key={t.code}
                className="ops-grid-header border-r border-b text-center"
                title={`${t.name} [${t.source}]`}
              >
                <span className={t.critical ? 'text-status-red' : ''}>{t.code}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map(dep => {
            const daysOut = getDaysUntilDeparture(dep.date);
            const readiness = calculateReadiness(dep.activities);
            const risk = calculateRisk(dep.activities);
            const isPast = daysOut < 0;

            return (
              <tr
                key={dep.id}
                className={`group transition-colors hover:bg-grid-hover ${isPast ? 'opacity-50' : ''} ${selectedIds.has(dep.id) ? 'bg-primary/5' : ''}`}
              >
                <td className="ops-grid-cell text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(dep.id)}
                    onChange={() => onToggleSelect(dep.id)}
                    className="w-3 h-3 accent-primary"
                  />
                </td>
                <td
                  className="ops-grid-cell font-mono cursor-pointer hover:text-primary transition-colors"
                  onClick={() => onRowClick(dep.id)}
                >
                  {format(new Date(dep.date), 'EEE dd MMM')}
                </td>
                <td className="ops-grid-cell font-mono text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    {dep.gtd && <ShieldCheck className="w-3.5 h-3.5 text-status-green shrink-0" />}
                    {dep.series}
                  </span>
                </td>
                <td className={`ops-grid-cell text-center font-mono font-semibold ${
                  daysOut <= 3 ? 'risk-red' : daysOut <= 7 ? 'risk-amber' : 'text-muted-foreground'
                }`}>
                  {daysOut < 0 ? `${Math.abs(daysOut)}–` : daysOut}
                </td>
                <td className="ops-grid-cell text-center font-mono text-muted-foreground">
                  {dep.paxCount}
                </td>
                <td className="ops-grid-cell text-center font-mono text-[10px] text-muted-foreground">
                  {dep.opsManager || '—'}
                </td>
                <td className="ops-grid-cell text-center font-mono text-[10px] text-muted-foreground">
                  {dep.opsExec || '—'}
                </td>
                <td className="ops-grid-cell text-center">
                  <ReadinessBar value={readiness} />
                </td>
                <td className="ops-grid-cell text-center">
                  <RiskIndicator risk={risk} />
                </td>
                {ACTIVITY_TEMPLATES.map(t => {
                  const activity = dep.activities.find(a => a.templateCode === t.code);
                  return activity ? (
                    <ActivityCell
                      key={t.code}
                      activity={activity}
                      onClick={() => onCellClick(dep.id, t.code)}
                    />
                  ) : (
                    <td key={t.code} className="ops-grid-cell text-center text-muted-foreground">—</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
