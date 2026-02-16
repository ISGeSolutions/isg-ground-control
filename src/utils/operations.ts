import { Activity, ActivityTemplate, RiskLevel } from '@/types/operations';
import { ACTIVITY_TEMPLATES } from '@/data/mockData';

export function getTemplate(code: string): ActivityTemplate | undefined {
  return ACTIVITY_TEMPLATES.find(t => t.code === code);
}

export function calculateReadiness(activities: Activity[]): number {
  const requiredActivities = activities.filter(a => {
    const t = getTemplate(a.templateCode);
    return t?.required;
  });
  if (requiredActivities.length === 0) return 100;
  const completed = requiredActivities.filter(a => a.status === 'complete').length;
  return Math.round((completed / requiredActivities.length) * 100);
}

export function calculateRisk(activities: Activity[]): RiskLevel {
  const hasCriticalOverdue = activities.some(a => {
    const t = getTemplate(a.templateCode);
    return t?.critical && a.status === 'overdue';
  });
  if (hasCriticalOverdue) return 'red';

  const hasAnyOverdue = activities.some(a => a.status === 'overdue');
  if (hasAnyOverdue) return 'amber';

  return 'green';
}

export function getDaysUntilDeparture(departureDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dep = new Date(departureDate);
  dep.setHours(0, 0, 0, 0);
  return Math.ceil((dep.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    waiting: 'Waiting',
    complete: 'Complete',
    overdue: 'Overdue',
  };
  return labels[status] || status;
}

export function getStatusClass(status: string): string {
  const classes: Record<string, string> = {
    not_started: 'status-not-started',
    in_progress: 'status-in-progress',
    waiting: 'status-waiting',
    complete: 'status-complete',
    overdue: 'status-overdue',
  };
  return classes[status] || '';
}

export function getRiskClass(risk: RiskLevel): string {
  return `risk-${risk}`;
}
