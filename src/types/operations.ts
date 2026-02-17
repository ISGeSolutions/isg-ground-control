export type ActivityStatus = 'not_started' | 'in_progress' | 'waiting' | 'complete' | 'overdue' | 'not_applicable';

export type RiskLevel = 'green' | 'amber' | 'red';

export type TaskSource = 'GLOBAL' | 'TG' | 'TS' | 'TD' | 'CUSTOM';

export type SLAReferenceDate = 'departure' | 'return' | 'ji_exists';

export type SLALevel = 'global' | 'tour_generic' | 'tour_series' | 'departure';

export interface SLARule {
  level: SLALevel;
  activityCode: string;
  offsetDays: number;
  referenceDate: SLAReferenceDate;
  required?: boolean;
  critical?: boolean;
}

export interface ActivityTemplate {
  code: string;
  name: string;
  required: boolean;
  critical: boolean;
  slaOffsetDays: number; // days before departure (default)
  referenceDate: SLAReferenceDate;
  source: TaskSource;
}

export interface Activity {
  id: string;
  templateCode: string;
  status: ActivityStatus;
  notes: string;
  updatedAt: string;
  updatedBy: string;
  dueDate: string;
  source: TaskSource;
}

export interface Departure {
  id: string;
  date: string; // ISO date
  returnDate?: string;
  jiSentDate?: string;
  destination: string;
  destinationCode: string;
  series: string;
  tourGeneric?: string;
  paxCount: number;
  bookingCount: number;
  activities: Activity[];
  travelSystemLink?: string;
  notes: string;
  opsManager?: string;
  opsExec?: string;
  guaranteed?: boolean; // GTD - guaranteed departure
}

export interface Series {
  id: string;
  name: string;
  code: string;
}

export interface User {
  id: string;
  name: string;
  initials: string;
  role: 'ops_manager' | 'ops_exec';
}

export interface FilterState {
  dateFrom: string;
  dateTo: string;
  series: string;
  destination: string;
  search: string;
  opsManager: string;
  opsExec: string;
}

export interface SummaryStats {
  overdue: number;
  dueLater: number;
  doneToday: number;
  donePast: number;
}
