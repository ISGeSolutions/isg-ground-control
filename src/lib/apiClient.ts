/**
 * ApiClient abstraction — Mock vs Http implementations.
 * Admin-only "Live" toggle persisted per-tenant in localStorage.
 */

import { Departure, Activity, ActivityStatus } from '@/types/operations';

// ─── Response wrapper ────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  meta?: { total: number; page: number; pageSize: number };
}

export interface ApiError {
  error: string;
  message: string;
  status: number;
}

// ─── Interface ───────────────────────────────────────────────────────────────
export interface IApiClient {
  getDepartures(filters?: Record<string, string>): Promise<ApiResponse<Departure[]>>;
  getDeparture(id: string): Promise<ApiResponse<Departure>>;
  updateActivity(departureId: string, activityId: string, patch: { status: ActivityStatus; notes?: string }): Promise<ApiResponse<Activity>>;
  getMe(): Promise<ApiResponse<UserProfile>>;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
  locale: {
    language: string;
    currency: string;
    timezone: string;
    dateFormat?: string;
    numberSeparator?: string;
    decimalPlaces?: number;
  };
  theme: {
    palette: string;
    mode: string;
  };
  branchConfig?: Record<string, unknown>;
  companyConfig?: Record<string, unknown>;
}

// ─── Toggle persistence ──────────────────────────────────────────────────────
const TOGGLE_KEY = (tenantId: string) => `ops-api-mode-${tenantId}`;

export type ApiMode = 'mock' | 'live';

export function getApiMode(tenantId: string): ApiMode {
  try {
    return (localStorage.getItem(TOGGLE_KEY(tenantId)) as ApiMode) || 'mock';
  } catch {
    return 'mock';
  }
}

export function setApiMode(tenantId: string, mode: ApiMode) {
  localStorage.setItem(TOGGLE_KEY(tenantId), mode);
}
