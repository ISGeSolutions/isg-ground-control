import { ActivityStatus, RiskLevel } from '@/types/operations';
import { getStatusLabel, getStatusClass, getRiskClass } from '@/utils/operations';
import { AlertTriangle, CheckCircle2, Clock, Circle, Loader2 } from 'lucide-react';

interface StatusBadgeProps {
  status: ActivityStatus;
  compact?: boolean;
}

const statusIcons: Record<ActivityStatus, React.ReactNode> = {
  not_started: <Circle className="w-3 h-3" />,
  in_progress: <Loader2 className="w-3 h-3" />,
  waiting: <Clock className="w-3 h-3" />,
  complete: <CheckCircle2 className="w-3 h-3" />,
  overdue: <AlertTriangle className="w-3 h-3" />,
  not_applicable: <span className="w-3 h-3 inline-flex items-center justify-center text-[9px] font-bold">N</span>,
};

export function StatusBadge({ status, compact }: StatusBadgeProps) {
  return (
    <span className={`status-badge ${getStatusClass(status)}`}>
      {statusIcons[status]}
      {!compact && <span>{getStatusLabel(status)}</span>}
    </span>
  );
}

interface RiskIndicatorProps {
  risk: RiskLevel;
}

export function RiskIndicator({ risk }: RiskIndicatorProps) {
  if (risk === 'green') {
    return <span className={`${getRiskClass(risk)} text-xs font-mono font-bold`}>●</span>;
  }
  if (risk === 'amber') {
    return <span className={`${getRiskClass(risk)} text-xs font-mono font-bold`}>▲</span>;
  }
  return <span className={`${getRiskClass(risk)} text-xs font-mono font-bold animate-pulse`}>◆</span>;
}

interface ReadinessBarProps {
  value: number;
}

export function ReadinessBar({ value }: ReadinessBarProps) {
  const color = value >= 80 ? 'bg-status-green' : value >= 50 ? 'bg-status-amber' : 'bg-status-red';
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-12 h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[10px] font-mono text-muted-foreground">{value}%</span>
    </div>
  );
}
