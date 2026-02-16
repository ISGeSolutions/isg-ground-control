import { useState, useMemo } from 'react';
import { Departure, ActivityStatus } from '@/types/operations';
import { ACTIVITY_TEMPLATES } from '@/data/mockData';
import { calculateReadiness, calculateRisk, getDaysUntilDeparture, getStatusLabel, getStatusClass, getTemplate } from '@/utils/operations';
import { StatusBadge, RiskIndicator, ReadinessBar } from './StatusBadge';
import { format } from 'date-fns';
import { ChevronDown, ChevronRight, Plane, Users, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface NextDeparturesViewProps {
  departures: Departure[];
  onDepartureClick: (departureId: string) => void;
  onCellClick: (departureId: string, activityCode: string) => void;
}

const COUNT_OPTIONS = [5, 10, 15, 25];

export function NextDeparturesView({ departures, onDepartureClick, onCellClick }: NextDeparturesViewProps) {
  const [count, setCount] = useState(10);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const upcoming = useMemo(() => {
    return departures
      .filter(d => getDaysUntilDeparture(d.date) >= 0)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, count);
  }, [departures, count]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(upcoming.map(d => d.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground font-medium">Show next</span>
          {COUNT_OPTIONS.map(n => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`h-6 px-2 rounded text-[11px] font-semibold transition-colors ${
                count === n
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button onClick={expandAll} className="text-muted-foreground hover:text-foreground transition-colors">
            Expand all
          </button>
          <span className="text-border">|</span>
          <button onClick={collapseAll} className="text-muted-foreground hover:text-foreground transition-colors">
            Collapse all
          </button>
        </div>
      </div>

      {/* Departure Cards */}
      <div className="space-y-2">
        {upcoming.map(dep => {
          const daysOut = getDaysUntilDeparture(dep.date);
          const readiness = calculateReadiness(dep.activities);
          const risk = calculateRisk(dep.activities);
          const isExpanded = expandedIds.has(dep.id);

          const completedCount = dep.activities.filter(a => a.status === 'complete').length;
          const totalApplicable = dep.activities.filter(a => a.status !== 'not_applicable').length;
          const overdueCount = dep.activities.filter(a => a.status === 'overdue').length;

          return (
            <div
              key={dep.id}
              className={`border border-border rounded-lg bg-card overflow-hidden transition-shadow ${
                risk === 'red' ? 'border-l-2 border-l-status-red' :
                risk === 'amber' ? 'border-l-2 border-l-status-amber' : ''
              }`}
            >
              {/* Card Header */}
              <div
                className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-grid-hover transition-colors"
                onClick={() => toggleExpand(dep.id)}
              >
                <button className="text-muted-foreground flex-shrink-0">
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>

                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="font-mono text-xs font-semibold text-foreground">
                    {format(new Date(dep.date), 'dd MMM')}
                  </span>
                  <span className="font-semibold text-xs text-foreground">{dep.destinationCode}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{dep.series}</span>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-[11px] font-mono font-semibold ${
                    daysOut <= 3 ? 'risk-red' : daysOut <= 7 ? 'risk-amber' : 'text-muted-foreground'
                  }`}>
                    {daysOut}d
                  </span>

                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span className="font-mono">{dep.paxCount}</span>
                  </div>

                  {overdueCount > 0 && (
                    <div className="flex items-center gap-0.5 text-[10px] risk-red">
                      <AlertTriangle className="w-3 h-3" />
                      <span className="font-mono font-semibold">{overdueCount}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3" />
                    <span className="font-mono">{completedCount}/{totalApplicable}</span>
                  </div>

                  <RiskIndicator risk={risk} />
                  <ReadinessBar value={readiness} />
                </div>
              </div>

              {/* Expanded Checklist */}
              {isExpanded && (
                <div className="border-t border-border bg-secondary/30">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-border/50">
                    {dep.activities
                      .filter(a => a.status !== 'not_applicable')
                      .map(activity => {
                        const template = getTemplate(activity.templateCode);
                        if (!template) return null;

                        return (
                          <div
                            key={activity.id}
                            className="bg-card px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-grid-hover transition-colors group"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCellClick(dep.id, activity.templateCode);
                            }}
                          >
                            <StatusBadge status={activity.status} compact />

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[11px] font-mono font-semibold ${template.critical ? 'text-status-red' : 'text-foreground'}`}>
                                  {template.code}
                                </span>
                                <span className="text-[10px] text-muted-foreground truncate">
                                  {template.name}
                                </span>
                              </div>
                              <div className="text-[9px] text-muted-foreground font-mono mt-0.5">
                                Due {format(new Date(activity.dueDate), 'dd MMM')}
                                {activity.updatedBy && (
                                  <span className="ml-1.5 opacity-60">· {activity.updatedBy}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Quick action row */}
                  <div className="px-3 py-1.5 flex items-center justify-end border-t border-border/50">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDepartureClick(dep.id);
                      }}
                      className="text-[10px] text-primary hover:text-primary/80 font-semibold transition-colors"
                    >
                      Open full details →
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {upcoming.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No upcoming departures found.
          </div>
        )}
      </div>
    </div>
  );
}
