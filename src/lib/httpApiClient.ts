/**
 * HttpApiClient — real HTTP implementation of IApiClient.
 * All requests use credentials: 'include' for httpOnly cookie sessions.
 * TODO: Wire to actual backend endpoints when available.
 */

import { IApiClient, ApiResponse, ApiError, UserProfile } from './apiClient';
import { Departure, Activity, ActivityStatus } from '@/types/operations';

export class HttpApiClient implements IApiClient {
  constructor(private baseUrl: string) {}

  private async request<T>(method: string, path: string, body?: unknown): Promise<ApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // httpOnly cookie session
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const err: ApiError = await res.json().catch(() => ({
        error: 'UNKNOWN',
        message: res.statusText,
        status: res.status,
      }));
      throw err;
    }

    return res.json();
  }

  async getDepartures(filters?: Record<string, string>): Promise<ApiResponse<Departure[]>> {
    const params = new URLSearchParams(filters || {}).toString();
    return this.request('GET', `/api/departures${params ? `?${params}` : ''}`);
  }

  async getDeparture(id: string): Promise<ApiResponse<Departure>> {
    return this.request('GET', `/api/departures/${id}`);
  }

  async updateActivity(
    departureId: string,
    activityId: string,
    patch: { status: ActivityStatus; notes?: string },
  ): Promise<ApiResponse<Activity>> {
    return this.request('PATCH', `/api/departures/${departureId}/activities/${activityId}`, patch);
  }

  async getMe(): Promise<ApiResponse<UserProfile>> {
    return this.request('GET', '/auth/me');
  }
}
