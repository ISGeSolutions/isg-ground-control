import { useMemo, useState } from 'react';
import { Departure, RiskLevel } from '@/types/operations';
import { calculateRisk, calculateReadiness, getDaysUntilDeparture } from '@/utils/operations';
import { ACTIVITY_TEMPLATES } from '@/data/mockData';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, Plane } from 'lucide-react';

interface CalendarViewProps {
  departures: Departure[];
  onDepartureClick: (departureId: string) => void;
}

export function CalendarView({ departures, onDepartureClick }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  // Build a map of date -> departures
  const departuresByDate = useMemo(() => {
    const map = new Map<string, Departure[]>();
    for (const dep of departures) {
      const key = dep.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(dep);
    }
    return map;
  }, [departures]);

  // Build a map of date -> activity deadlines
  const deadlinesByDate = useMemo(() => {
    const map = new Map<string, { code: string; status: string; depDest: string }[]>();
    for (const dep of departures) {
      for (const act of dep.activities) {
        if (act.status === 'not_applicable') continue;
        const key = act.dueDate;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push({ code: act.templateCode, status: act.status, depDest: dep.destinationCode });
      }
    }
    return map;
  }, [departures]);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="flex flex-col h-full">
      {/* Month Navigation */}
      <div className="flex items-center justify-between px-2 py-3">
        <button
          onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
          className="p-1.5 hover:bg-secondary rounded-md transition-colors text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h2 className="text-sm font-semibold text-foreground">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
          className="p-1.5 hover:bg-secondary rounded-md transition-colors text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {weekDays.map(d => (
          <div key={d} className="px-1 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* Day Grid */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {days.map((day, i) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);
          const deps = departuresByDate.get(dateStr) || [];
          const deadlines = deadlinesByDate.get(dateStr) || [];
          const overdueDeadlines = deadlines.filter(d => d.status === 'overdue');

          return (
            <div
              key={i}
              className={`
                border-b border-r border-border p-1 min-h-[90px] transition-colors
                ${!inMonth ? 'opacity-30' : ''}
                ${today ? 'bg-primary/5' : 'hover:bg-secondary/30'}
              `}
            >
              {/* Day Number */}
              <div className="flex items-center justify-between mb-0.5">
                <span className={`text-[11px] font-mono ${today ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                  {format(day, 'd')}
                </span>
                {overdueDeadlines.length > 0 && (
                  <AlertTriangle className="w-3 h-3 text-status-red" />
                )}
              </div>

              {/* Departure Cards */}
              {deps.map(dep => {
                const risk = calculateRisk(dep.activities);
                const readiness = calculateReadiness(dep.activities);
                return (
                  <button
                    key={dep.id}
                    onClick={() => onDepartureClick(dep.id)}
                    className={`
                      w-full text-left mb-0.5 px-1.5 py-1 rounded text-[10px] transition-colors cursor-pointer
                      ${risk === 'red' ? 'bg-status-red-muted text-status-red border-l-2 border-status-red' :
                        risk === 'amber' ? 'bg-status-amber-muted text-status-amber border-l-2 border-status-amber' :
                        'bg-status-green-muted text-status-green border-l-2 border-status-green'}
                      hover:brightness-125
                    `}
                  >
                    <div className="flex items-center gap-1">
                      <Plane className="w-2.5 h-2.5 flex-shrink-0" />
                      <span className="font-mono font-semibold">{dep.destinationCode}</span>
                      <span className="text-[9px] opacity-70 ml-auto">{readiness}%</span>
                    </div>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <span className="text-[9px] opacity-60">{dep.paxCount} pax · {dep.series}</span>
                    </div>
                  </button>
                );
              })}

              {/* Activity Deadline Dots */}
              {deadlines.length > 0 && deps.length === 0 && (
                <div className="flex flex-wrap gap-0.5 mt-0.5">
                  {deadlines.slice(0, 6).map((dl, j) => (
                    <span
                      key={j}
                      title={`${dl.code} (${dl.depDest}) - ${dl.status}`}
                      className={`
                        inline-block w-2 h-2 rounded-full
                        ${dl.status === 'complete' ? 'bg-status-green' :
                          dl.status === 'overdue' ? 'bg-status-red' :
                          dl.status === 'in_progress' ? 'bg-status-blue' :
                          dl.status === 'waiting' ? 'bg-status-amber' :
                          'bg-muted-foreground/30'}
                      `}
                    />
                  ))}
                  {deadlines.length > 6 && (
                    <span className="text-[8px] text-muted-foreground">+{deadlines.length - 6}</span>
                  )}
                </div>
              )}

              {/* Deadline dots below departure cards */}
              {deadlines.length > 0 && deps.length > 0 && (
                <div className="flex flex-wrap gap-0.5 mt-0.5">
                  {deadlines.slice(0, 4).map((dl, j) => (
                    <span
                      key={j}
                      title={`${dl.code} (${dl.depDest}) - ${dl.status}`}
                      className={`
                        inline-block w-1.5 h-1.5 rounded-full
                        ${dl.status === 'complete' ? 'bg-status-green' :
                          dl.status === 'overdue' ? 'bg-status-red' :
                          dl.status === 'in_progress' ? 'bg-status-blue' :
                          dl.status === 'waiting' ? 'bg-status-amber' :
                          'bg-muted-foreground/30'}
                      `}
                    />
                  ))}
                  {deadlines.length > 4 && (
                    <span className="text-[8px] text-muted-foreground">+{deadlines.length - 4}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
