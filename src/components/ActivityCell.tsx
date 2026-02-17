import { Activity } from '@/types/operations';
import { getTemplate } from '@/utils/operations';
import { CheckCircle2, AlertTriangle, Circle } from 'lucide-react';

interface ActivityCellProps {
  activity: Activity;
  onClick: () => void;
}

type CellStatus = 'done' | 'overdue' | 'due_soon' | 'due_later' | 'blank';

function getCellStatus(activity: Activity): CellStatus {
  if (activity.status === 'not_applicable') return 'blank';
  if (activity.status === 'complete') return 'done';
  if (activity.status === 'overdue') return 'overdue';
  // Check if due within 4 weeks
  const now = new Date();
  const dueDate = new Date(activity.dueDate);
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 28) return 'due_soon';
  return 'due_later';
}

const cellStyles: Record<CellStatus, string> = {
  done: 'text-status-green bg-status-green-muted hover:brightness-125',
  overdue: 'text-status-red bg-status-red-muted hover:brightness-125',
  due_soon: 'text-status-amber bg-status-amber-muted hover:brightness-125',
  due_later: 'text-status-blue bg-status-blue-muted hover:brightness-125',
  blank: '',
};

const cellIcons: Record<CellStatus, React.ReactNode> = {
  done: <CheckCircle2 className="w-3 h-3" />,
  overdue: <AlertTriangle className="w-3 h-3" />,
  due_soon: <Circle className="w-3 h-3 fill-current" />,
  due_later: <Circle className="w-3 h-3" />,
  blank: null,
};

export function ActivityCell({ activity, onClick }: ActivityCellProps) {
  const template = getTemplate(activity.templateCode);
  const cellStatus = getCellStatus(activity);

  if (cellStatus === 'blank') {
    return <td className="ops-grid-cell text-center" />;
  }

  const isCritical = template?.critical && cellStatus === 'overdue';

  return (
    <td
      onClick={onClick}
      className={`
        ops-grid-cell cursor-pointer transition-all text-center
        ${cellStyles[cellStatus]}
        ${isCritical ? 'animate-pulse ring-1 ring-status-red' : ''}
      `}
      title={`${template?.name || activity.templateCode}: ${cellStatus}`}
    >
      <span className="inline-flex items-center justify-center">
        {cellIcons[cellStatus]}
      </span>
    </td>
  );
}
