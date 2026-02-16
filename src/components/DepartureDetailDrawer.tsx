import { Departure, Activity, ActivityStatus } from '@/types/operations';
import { ACTIVITY_TEMPLATES } from '@/data/mockData';
import { getTemplate, getStatusLabel, getDaysUntilDeparture, getSourceLabel } from '@/utils/operations';
import { StatusBadge } from './StatusBadge';
import { X, ExternalLink, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

interface DepartureDetailDrawerProps {
  departure: Departure;
  selectedActivityCode?: string;
  onClose: () => void;
  onUpdateActivity: (departureId: string, activityId: string, status: ActivityStatus, notes?: string) => void;
}

const ALL_STATUSES: ActivityStatus[] = ['not_started', 'in_progress', 'waiting', 'complete', 'overdue', 'not_applicable'];

export function DepartureDetailDrawer({ departure, selectedActivityCode, onClose, onUpdateActivity }: DepartureDetailDrawerProps) {
  const daysOut = getDaysUntilDeparture(departure.date);
  const [expandedActivity, setExpandedActivity] = useState<string | null>(selectedActivityCode || null);

  return (
    <>
      <div className="drawer-overlay animate-fade-in" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-[420px] max-w-[90vw] z-50 bg-card border-l border-border shadow-2xl animate-slide-in-right overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 z-10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {departure.destination}
                <span className="ml-1.5 text-muted-foreground font-mono text-xs">{departure.destinationCode}</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {format(new Date(departure.date), 'EEE dd MMM yyyy')} · {departure.series}
              </p>
              {departure.tourGeneric && (
                <p className="text-[10px] text-muted-foreground mt-0.5">{departure.tourGeneric}</p>
              )}
            </div>
            <button onClick={onClose} className="p-1 hover:bg-secondary rounded transition-colors text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Meta */}
          <div className="flex gap-4 mt-3 text-xs flex-wrap">
            <div>
              <span className="text-muted-foreground">Days Out</span>
              <p className={`font-mono font-semibold ${daysOut <= 3 ? 'risk-red' : daysOut <= 7 ? 'risk-amber' : 'text-foreground'}`}>
                {daysOut < 0 ? `${Math.abs(daysOut)}d ago` : `${daysOut}d`}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Pax</span>
              <p className="font-mono font-semibold text-foreground">{departure.paxCount}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Bookings</span>
              <p className="font-mono font-semibold text-foreground">{departure.bookingCount}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Mgr</span>
              <p className="font-mono font-semibold text-foreground">{departure.opsManager || '—'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Exec</span>
              <p className="font-mono font-semibold text-foreground">{departure.opsExec || '—'}</p>
            </div>
          </div>

          {departure.returnDate && (
            <p className="text-[10px] text-muted-foreground mt-1">
              Return: {format(new Date(departure.returnDate), 'dd MMM yyyy')}
              {departure.jiSentDate && ` · JI Sent: ${format(new Date(departure.jiSentDate), 'dd MMM yyyy')}`}
            </p>
          )}

          {departure.travelSystemLink && (
            <a
              href={departure.travelSystemLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-[10px] text-primary hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              Open in Travel System
            </a>
          )}
        </div>

        {/* Activity Checklist */}
        <div className="p-4">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Activity Checklist
          </h3>
          <div className="space-y-1">
            {departure.activities.map(activity => {
              const template = getTemplate(activity.templateCode);
              const isExpanded = expandedActivity === activity.templateCode;
              return (
                <div key={activity.id} className="border border-border rounded-md overflow-hidden">
                  <button
                    onClick={() => setExpandedActivity(isExpanded ? null : activity.templateCode)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-secondary/50 transition-colors"
                  >
                    <StatusBadge status={activity.status} compact />
                    <span className="font-mono font-semibold text-muted-foreground w-6">{activity.templateCode}</span>
                    <span className="text-foreground flex-1 text-left">{template?.name}</span>
                    <span className="text-[8px] font-mono text-muted-foreground/60 uppercase">{activity.source}</span>
                    {template?.required && (
                      <span className="text-[9px] uppercase tracking-wider text-primary font-semibold">req</span>
                    )}
                    {template?.critical && (
                      <span className="text-[9px] uppercase tracking-wider risk-red font-semibold">crit</span>
                    )}
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Due {format(new Date(activity.dueDate), 'dd MMM')}
                    </span>
                    <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-border bg-secondary/20 space-y-2">
                      <div className="flex gap-1 flex-wrap">
                        {ALL_STATUSES.map(s => (
                          <button
                            key={s}
                            onClick={() => onUpdateActivity(departure.id, activity.id, s)}
                            className={`status-badge cursor-pointer transition-all ${
                              activity.status === s ? 'ring-1 ring-foreground/30 scale-105' : 'opacity-50 hover:opacity-80'
                            } ${s === 'not_started' ? 'status-not-started' : s === 'in_progress' ? 'status-in-progress' : s === 'waiting' ? 'status-waiting' : s === 'complete' ? 'status-complete' : s === 'not_applicable' ? 'status-na' : 'status-overdue'}`}
                          >
                            {getStatusLabel(s)}
                          </button>
                        ))}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Source: {getSourceLabel(activity.source)} · Last updated: {activity.updatedAt} by {activity.updatedBy}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
