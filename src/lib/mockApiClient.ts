/**
 * MockApiClient — wraps existing mock data generators behind the IApiClient interface.
 */

import { IApiClient, ApiResponse, UserProfile } from './apiClient';
import { Departure, Activity, ActivityStatus } from '@/types/operations';
import { generateMockDepartures } from '@/data/mockData';

let cachedDepartures: Departure[] | null = null;

function getDepartures(): Departure[] {
  if (!cachedDepartures) cachedDepartures = generateMockDepartures();
  return cachedDepartures;
}

export class MockApiClient implements IApiClient {
  private latency = 200; // simulate network

  private async delay<T>(value: T): Promise<T> {
    return new Promise(resolve => setTimeout(() => resolve(value), this.latency));
  }

  async getDepartures(filters?: Record<string, string>): Promise<ApiResponse<Departure[]>> {
    let deps = getDepartures();
    if (filters?.series) deps = deps.filter(d => d.series === filters.series);
    if (filters?.destination) deps = deps.filter(d => d.destination === filters.destination);
    return this.delay({ data: deps, meta: { total: deps.length, page: 1, pageSize: deps.length } });
  }

  async getDeparture(id: string): Promise<ApiResponse<Departure>> {
    const dep = getDepartures().find(d => d.id === id);
    if (!dep) throw { error: 'NOT_FOUND', message: 'Departure not found', status: 404 };
    return this.delay({ data: dep });
  }

  async updateActivity(departureId: string, activityId: string, patch: { status: ActivityStatus; notes?: string }): Promise<ApiResponse<Activity>> {
    const deps = getDepartures();
    const dep = deps.find(d => d.id === departureId);
    if (!dep) throw { error: 'NOT_FOUND', message: 'Departure not found', status: 404 };
    const act = dep.activities.find(a => a.id === activityId);
    if (!act) throw { error: 'NOT_FOUND', message: 'Activity not found', status: 404 };
    act.status = patch.status;
    if (patch.notes !== undefined) act.notes = patch.notes;
    act.updatedAt = new Date().toISOString().split('T')[0];
    return this.delay({ data: { ...act } });
  }

  async getMe(): Promise<ApiResponse<UserProfile>> {
    return this.delay({
      data: {
        id: 'mock-user-1',
        email: 'sarah@acme.example.com',
        displayName: 'Sarah Chen',
        roles: ['ops_manager', 'admin'],
        locale: {
          language: 'en-GB',
          currency: 'GBP',
          timezone: 'Europe/London',
          dateFormat: 'dd/MM/yyyy',
          numberSeparator: ',',
          decimalPlaces: 2,
        },
        theme: { palette: 'ocean', mode: 'dark' },
      },
    });
  }

  /** Force regenerate mock data */
  refresh() {
    cachedDepartures = null;
  }
}
