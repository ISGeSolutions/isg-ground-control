import { Activity, ActivityTemplate, RiskLevel, SummaryStats, SLARule, SLAReferenceDate, SLALevel, Departure } from '@/types/operations';
import { ACTIVITY_TEMPLATES, GLOBAL_SLA_RULES, SERIES_SLA_OVERRIDES } from '@/data/mockData';
import { subDays, format } from 'date-fns';

export function getTemplate(code: string): ActivityTemplate | undefined {
  return ACTIVITY_TEMPLATES.find(t => t.code === code);
}

export function calculateReadiness(activities: Activity[]): number {
  const requiredActivities = activities.filter(a => {
    if (a.status === 'not_applicable') return false;
    const t = getTemplate(a.templateCode);
    return t?.required;
  });
  if (requiredActivities.length === 0) return 100;
  const completed = requiredActivities.filter(a => a.status === 'complete').length;
  return Math.round((completed / requiredActivities.length) * 100);
}

export function calculateRisk(activities: Activity[]): RiskLevel {
  const applicable = activities.filter(a => a.status !== 'not_applicable');
  
  const hasCriticalOverdue = applicable.some(a => {
    const t = getTemplate(a.templateCode);
    return t?.critical && a.status === 'overdue';
  });
  if (hasCriticalOverdue) return 'red';

  const hasAnyOverdue = applicable.some(a => a.status === 'overdue');
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
    not_applicable: 'N/A',
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
    not_applicable: 'status-na',
  };
  return classes[status] || '';
}

export function getRiskClass(risk: RiskLevel): string {
  return `risk-${risk}`;
}

export function getSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    GLOBAL: 'Global',
    TG: 'Tour Generic',
    TS: 'Tour Series',
    TD: 'Tour Departure',
    CUSTOM: 'Custom',
  };
  return labels[source] || source;
}

// ─── SLA Hierarchy Engine ──────────────────────────────────────────────────────

/**
 * Resolves the effective SLA rule for an activity code by walking
 * the hierarchy: Departure → Tour Series → Tour Generic → Global.
 * The most specific (lowest) level wins.
 */
export function resolveEffectiveSLA(
  activityCode: string,
  departureOverrides: SLARule[] = [],
  seriesOverrides: SLARule[] = SERIES_SLA_OVERRIDES,
  tourGenericOverrides: SLARule[] = [],
  globalRules: SLARule[] = GLOBAL_SLA_RULES
): SLARule | undefined {
  const levels: { rules: SLARule[] }[] = [
    { rules: departureOverrides },
    { rules: seriesOverrides },
    { rules: tourGenericOverrides },
    { rules: globalRules },
  ];

  for (const { rules } of levels) {
    const match = rules.find(r => r.activityCode === activityCode);
    if (match) return match;
  }
  return undefined;
}

/**
 * Calculate the due date for an activity given reference dates and SLA offset.
 */
export function calculateDueDate(
  referenceDate: SLAReferenceDate,
  offsetDays: number,
  departure: { date: string; returnDate?: string; jiSentDate?: string }
): string {
  let baseDate: Date;
  switch (referenceDate) {
    case 'return':
      baseDate = departure.returnDate ? new Date(departure.returnDate) : new Date(departure.date);
      break;
    case 'ji_exists':
      baseDate = departure.jiSentDate ? new Date(departure.jiSentDate) : new Date(departure.date);
      break;
    case 'departure':
    default:
      baseDate = new Date(departure.date);
      break;
  }
  return format(subDays(baseDate, offsetDays), 'yyyy-MM-dd');
}

// ─── Summary Stats ─────────────────────────────────────────────────────────────

export function calculateSummaryStats(departures: Departure[]): SummaryStats {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  let overdue = 0;
  let dueLater = 0;
  let doneToday = 0;
  let donePast = 0;

  for (const dep of departures) {
    for (const act of dep.activities) {
      if (act.status === 'not_applicable') continue;
      if (act.status === 'overdue') {
        overdue++;
      } else if (act.status === 'complete') {
        if (act.updatedAt === todayStr) {
          doneToday++;
        } else {
          donePast++;
        }
      } else if (act.dueDate > todayStr) {
        dueLater++;
      }
    }
  }

  return { overdue, dueLater, doneToday, donePast };
}
