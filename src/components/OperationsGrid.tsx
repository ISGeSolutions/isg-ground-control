import { Departure, ActivityStatus, FilterState } from '@/types/operations';
import { ACTIVITY_TEMPLATES } from '@/data/mockData';
import { calculateReadiness, calculateRisk, getDaysUntilDeparture } from '@/utils/operations';
import { ActivityCell } from './ActivityCell';
import { RiskIndicator, ReadinessBar } from './StatusBadge';
import { format } from 'date-fns';
import { GridDensity, densityClasses } from '@/contexts/PreferencesContext';

interface OperationsGridProps {
  departures: Departure[];
  onCellClick: (departureId: string, activityCode: string) => void;
  onRowClick: (departureId: string) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  density?: GridDensity;
}

export function OperationsGrid({ departures, onCellClick, onRowClick, selectedIds, onToggleSelect, density = 'default' }: OperationsGridProps) {
  const dc = densityClasses(density);
  return (
    <div className="overflow-auto border border-border rounded-lg" data-density={density}>
      <table className="w-full border-collapse min-w-[1100px]">
        <thead className="sticky top-0 z-10">
          <tr>
            <th className="ops-grid-header w-8 border-r border-b text-center">
              <input type="checkbox" className="w-3 h-3 accent-primary" onChange={() => {}} />
            </th>
            <th className="ops-grid-header border-r border-b text-left">Date</th>
            <th className="ops-grid-header border-r border-b text-left">Series</th>
            <th className="ops-grid-header border-r border-b text-center">Days</th>
            <th className="ops-grid-header border-r border-b text-center">Pax</th>
            <th className="ops-grid-header border-r border-b text-center">Mgr</th>
            <th className="ops-grid-header border-r border-b text-center">Exec</th>
            <th className="ops-grid-header border-r border-b text-center">Ready</th>
            <th className="ops-grid-header border-r border-b text-center w-8">Risk</th>
            {ACTIVITY_TEMPLATES.map(t => (
              <th
                key={t.code}
                className="ops-grid-header border-r border-b text-center"
                title={`${t.name} [${t.source}]`}
              >
                <span className={t.critical ? 'text-status-red' : ''}>{t.code}</span>
                <span className="block text-[8px] opacity-50 normal-case tracking-normal">{t.source}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {departures.map(dep => {
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
                  {format(new Date(dep.date), 'dd MMM')}
                </td>
                <td className="ops-grid-cell font-mono text-muted-foreground">{dep.series}</td>
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
