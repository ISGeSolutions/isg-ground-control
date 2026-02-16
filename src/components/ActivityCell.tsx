import { Activity, ActivityStatus } from '@/types/operations';
import { getTemplate, getStatusClass } from '@/utils/operations';
import { CheckCircle2, Circle, Clock, Loader2, AlertTriangle } from 'lucide-react';

interface ActivityCellProps {
  activity: Activity;
  onClick: () => void;
}

const miniIcons: Record<ActivityStatus, React.ReactNode> = {
  not_started: <Circle className="w-3 h-3 opacity-40" />,
  in_progress: <Loader2 className="w-3 h-3" />,
  waiting: <Clock className="w-3 h-3" />,
  complete: <CheckCircle2 className="w-3 h-3" />,
  overdue: <AlertTriangle className="w-3 h-3" />,
};

const cellColors: Record<ActivityStatus, string> = {
  not_started: 'text-status-grey bg-transparent hover:bg-secondary/50',
  in_progress: 'text-status-blue bg-status-blue-muted hover:brightness-125',
  waiting: 'text-status-amber bg-status-amber-muted hover:brightness-125',
  complete: 'text-status-green bg-status-green-muted hover:brightness-125',
  overdue: 'text-status-red bg-status-red-muted hover:brightness-125',
};

export function ActivityCell({ activity, onClick }: ActivityCellProps) {
  const template = getTemplate(activity.templateCode);
  const isCritical = template?.critical && activity.status === 'overdue';

  return (
    <td
      onClick={onClick}
      className={`
        ops-grid-cell cursor-pointer transition-all text-center
        ${cellColors[activity.status]}
        ${isCritical ? 'animate-pulse ring-1 ring-status-red' : ''}
      `}
      title={`${template?.name || activity.templateCode}: ${activity.status}`}
    >
      <span className="inline-flex items-center justify-center">
        {miniIcons[activity.status]}
      </span>
    </td>
  );
}
