export type ActivityStatus = 'not_started' | 'in_progress' | 'waiting' | 'complete' | 'overdue';

export type RiskLevel = 'green' | 'amber' | 'red';

export interface ActivityTemplate {
  code: string;
  name: string;
  required: boolean;
  critical: boolean;
  slaOffsetDays: number; // days before departure
}

export interface Activity {
  id: string;
  templateCode: string;
  status: ActivityStatus;
  notes: string;
  updatedAt: string;
  updatedBy: string;
  dueDate: string;
}

export interface Departure {
  id: string;
  date: string; // ISO date
  destination: string;
  destinationCode: string;
  series: string;
  paxCount: number;
  bookingCount: number;
  activities: Activity[];
  travelSystemLink?: string;
  notes: string;
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
}

export interface FilterState {
  dateFrom: string;
  dateTo: string;
  series: string;
  destination: string;
  search: string;
}
