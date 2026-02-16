import { useMemo } from 'react';
import { Departure } from '@/types/operations';
import { calculateReadiness } from '@/utils/operations';
import { format, parseISO } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ReadinessHeatmapProps {
  departures: Departure[];
  onDepartureClick: (departureId: string) => void;
}

function getReadinessColor(value: number): string {
  if (value === 100) return 'bg-[hsl(var(--status-green))]';
  if (value >= 80) return 'bg-[hsl(var(--status-green)/0.7)]';
  if (value >= 60) return 'bg-[hsl(var(--status-amber)/0.8)]';
  if (value >= 40) return 'bg-[hsl(var(--status-amber)/0.5)]';
  if (value >= 20) return 'bg-[hsl(var(--status-red)/0.6)]';
  return 'bg-[hsl(var(--status-red)/0.9)]';
}

export function ReadinessHeatmap({ departures, onDepartureClick }: ReadinessHeatmapProps) {
  const { dates, destinations, grid } = useMemo(() => {
    const dateSet = new Set<string>();
    const destSet = new Set<string>();
    const map = new Map<string, { readiness: number; id: string; pax: number }>();

    for (const dep of departures) {
      dateSet.add(dep.date);
      destSet.add(dep.destination);
      const key = `${dep.date}|${dep.destination}`;
      map.set(key, {
        readiness: calculateReadiness(dep.activities),
        id: dep.id,
        pax: dep.paxCount,
      });
    }

    const dates = Array.from(dateSet).sort();
    const destinations = Array.from(destSet).sort();
    return { dates, destinations, grid: map };
  }, [departures]);

  if (departures.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        No departures to display.
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      {/* Legend */}
      <div className="flex items-center gap-3 mb-3 text-[10px] text-muted-foreground">
        <span className="font-semibold uppercase tracking-wider">Readiness %</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-3 rounded-sm bg-[hsl(var(--status-red)/0.9)]" />
          <span>0-19</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-3 rounded-sm bg-[hsl(var(--status-red)/0.6)]" />
          <span>20-39</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-3 rounded-sm bg-[hsl(var(--status-amber)/0.5)]" />
          <span>40-59</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-3 rounded-sm bg-[hsl(var(--status-amber)/0.8)]" />
          <span>60-79</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-3 rounded-sm bg-[hsl(var(--status-green)/0.7)]" />
          <span>80-99</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-3 rounded-sm bg-[hsl(var(--status-green))]" />
          <span>100</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="border-collapse">
          <thead>
            <tr>
              <th className="ops-grid-header sticky left-0 z-10 bg-[hsl(var(--grid-header))] text-left min-w-[120px]">
                Destination
              </th>
              {dates.map(date => (
                <th key={date} className="ops-grid-header text-center px-1 min-w-[40px]">
                  {format(parseISO(date), 'dd MMM')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {destinations.map(dest => (
              <tr key={dest} className="hover:bg-[hsl(var(--grid-row-hover))]">
                <td className="ops-grid-cell sticky left-0 z-10 bg-card font-medium text-foreground">
                  {dest}
                </td>
                {dates.map(date => {
                  const key = `${date}|${dest}`;
                  const cell = grid.get(key);
                  if (!cell) {
                    return (
                      <td key={date} className="ops-grid-cell text-center">
                        <div className="w-7 h-7 mx-auto rounded-sm bg-muted/30" />
                      </td>
                    );
                  }
                  return (
                    <td key={date} className="ops-grid-cell text-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => onDepartureClick(cell.id)}
                            className={`w-7 h-7 mx-auto rounded-sm ${getReadinessColor(cell.readiness)} flex items-center justify-center text-[9px] font-mono font-bold text-white/90 hover:ring-1 hover:ring-primary transition-all cursor-pointer`}
                          >
                            {cell.readiness}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <p className="font-semibold">{dest}</p>
                          <p>{format(parseISO(date), 'dd MMM yyyy')}</p>
                          <p>Readiness: {cell.readiness}%</p>
                          <p>Pax: {cell.pax}</p>
                        </TooltipContent>
                      </Tooltip>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
