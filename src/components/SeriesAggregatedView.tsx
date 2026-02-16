import { useMemo, useState } from 'react';
import { Departure } from '@/types/operations';
import { ACTIVITY_TEMPLATES, SERIES } from '@/data/mockData';
import { calculateReadiness, calculateRisk, getDaysUntilDeparture, getTemplate } from '@/utils/operations';
import { RiskIndicator, ReadinessBar } from './StatusBadge';
import { format } from 'date-fns';
import { ChevronDown, ChevronRight, Layers, Users, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface SeriesAggregatedViewProps {
  departures: Departure[];
  onDepartureClick: (departureId: string) => void;
}

interface SeriesStats {
  code: string;
  name: string;
  departures: Departure[];
  totalDepartures: number;
  totalPax: number;
  avgReadiness: number;
  riskCounts: { green: number; amber: number; red: number };
  activityStats: { code: string; name: string; complete: number; inProgress: number; overdue: number; total: number }[];
  nextDeparture: Departure | null;
}

export function SeriesAggregatedView({ departures, onDepartureClick }: SeriesAggregatedViewProps) {
  const [expandedSeries, setExpandedSeries] = useState<Set<string>>(new Set());

  const seriesData = useMemo(() => {
    const grouped = new Map<string, Departure[]>();
    for (const dep of departures) {
      if (!grouped.has(dep.series)) grouped.set(dep.series, []);
      grouped.get(dep.series)!.push(dep);
    }

    const result: SeriesStats[] = [];
    for (const [code, deps] of grouped) {
      const seriesInfo = SERIES.find(s => s.code === code);
      const totalPax = deps.reduce((sum, d) => sum + d.paxCount, 0);
      const avgReadiness = deps.length > 0
        ? Math.round(deps.reduce((sum, d) => sum + calculateReadiness(d.activities), 0) / deps.length)
        : 0;

      const riskCounts = { green: 0, amber: 0, red: 0 };
      for (const d of deps) {
        riskCounts[calculateRisk(d.activities)]++;
      }

      const activityStats = ACTIVITY_TEMPLATES.map(t => {
        let complete = 0, inProgress = 0, overdue = 0, total = 0;
        for (const d of deps) {
          const act = d.activities.find(a => a.templateCode === t.code);
          if (!act || act.status === 'not_applicable') continue;
          total++;
          if (act.status === 'complete') complete++;
          else if (act.status === 'in_progress') inProgress++;
          else if (act.status === 'overdue') overdue++;
        }
        return { code: t.code, name: t.name, complete, inProgress, overdue, total };
      });

      const futureDeps = deps
        .filter(d => getDaysUntilDeparture(d.date) >= 0)
        .sort((a, b) => a.date.localeCompare(b.date));

      result.push({
        code,
        name: seriesInfo?.name || code,
        departures: deps.sort((a, b) => a.date.localeCompare(b.date)),
        totalDepartures: deps.length,
        totalPax,
        avgReadiness,
        riskCounts,
        activityStats,
        nextDeparture: futureDeps[0] || null,
      });
    }

    return result.sort((a, b) => a.code.localeCompare(b.code));
  }, [departures]);

  const toggleSeries = (code: string) => {
    setExpandedSeries(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });
  };

  return (
    <div className="space-y-3 overflow-auto">
      {seriesData.map(series => {
        const isExpanded = expandedSeries.has(series.code);
        const worstRisk = series.riskCounts.red > 0 ? 'red' : series.riskCounts.amber > 0 ? 'amber' : 'green';

        return (
          <div
            key={series.code}
            className={`border border-border rounded-lg bg-card overflow-hidden ${
              worstRisk === 'red' ? 'border-l-2 border-l-status-red' :
              worstRisk === 'amber' ? 'border-l-2 border-l-status-amber' : ''
            }`}
          >
            {/* Series Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-grid-hover transition-colors"
              onClick={() => toggleSeries(series.code)}
            >
              <button className="text-muted-foreground flex-shrink-0">
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              <div className="flex items-center gap-2 min-w-0">
                <Layers className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="font-mono text-sm font-bold text-foreground">{series.code}</span>
                <span className="text-xs text-muted-foreground truncate">{series.name}</span>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0 ml-auto">
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <span className="font-mono font-semibold text-foreground">{series.totalDepartures}</span>
                  <span>deps</span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Users className="w-3 h-3" />
                  <span className="font-mono">{series.totalPax}</span>
                </div>

                {/* Risk breakdown */}
                <div className="flex items-center gap-1.5">
                  {series.riskCounts.red > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] risk-red font-mono font-semibold">
                      <AlertTriangle className="w-3 h-3" />{series.riskCounts.red}
                    </span>
                  )}
                  {series.riskCounts.amber > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] risk-amber font-mono font-semibold">
                      <Clock className="w-3 h-3" />{series.riskCounts.amber}
                    </span>
                  )}
                  {series.riskCounts.green > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] risk-green font-mono font-semibold">
                      <CheckCircle2 className="w-3 h-3" />{series.riskCounts.green}
                    </span>
                  )}
                </div>

                <ReadinessBar value={series.avgReadiness} />

                {series.nextDeparture && (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Next: {format(new Date(series.nextDeparture.date), 'dd MMM')}
                  </span>
                )}
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="border-t border-border">
                {/* Activity completion bars */}
                <div className="px-4 py-3 bg-secondary/30">
                  <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Activity Completion
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    {series.activityStats.map(act => {
                      const template = getTemplate(act.code);
                      const pct = act.total > 0 ? Math.round((act.complete / act.total) * 100) : 0;
                      const overduePct = act.total > 0 ? Math.round((act.overdue / act.total) * 100) : 0;

                      return (
                        <div key={act.code} className="bg-card rounded p-2 border border-border/50">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-[11px] font-mono font-semibold ${template?.critical ? 'text-status-red' : 'text-foreground'}`}>
                              {act.code}
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {act.complete}/{act.total}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden flex">
                            <div
                              className="h-full bg-status-green transition-all"
                              style={{ width: `${pct}%` }}
                            />
                            <div
                              className="h-full bg-status-red transition-all"
                              style={{ width: `${overduePct}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[9px] text-muted-foreground">{act.name}</span>
                            {act.overdue > 0 && (
                              <span className="text-[9px] risk-red font-mono">{act.overdue} overdue</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Departure list */}
                <div className="divide-y divide-border/50">
                  {series.departures.map(dep => {
                    const daysOut = getDaysUntilDeparture(dep.date);
                    const readiness = calculateReadiness(dep.activities);
                    const risk = calculateRisk(dep.activities);
                    const isPast = daysOut < 0;

                    return (
                      <div
                        key={dep.id}
                        className={`flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-grid-hover transition-colors ${isPast ? 'opacity-50' : ''}`}
                        onClick={() => onDepartureClick(dep.id)}
                      >
                        <span className="font-mono text-[11px] text-foreground w-14">
                          {format(new Date(dep.date), 'dd MMM')}
                        </span>
                        <span className="text-[11px] font-semibold text-foreground w-10">{dep.destinationCode}</span>
                        <span className={`text-[11px] font-mono font-semibold w-8 text-center ${
                          daysOut <= 3 ? 'risk-red' : daysOut <= 7 ? 'risk-amber' : 'text-muted-foreground'
                        }`}>
                          {daysOut < 0 ? `${Math.abs(daysOut)}–` : `${daysOut}d`}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono w-10 text-center">{dep.paxCount} pax</span>
                        <RiskIndicator risk={risk} />
                        <ReadinessBar value={readiness} />
                        <span className="text-[10px] text-muted-foreground font-mono ml-auto">
                          {dep.opsManager || '—'} / {dep.opsExec || '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {seriesData.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No departures found.
        </div>
      )}
    </div>
  );
}
