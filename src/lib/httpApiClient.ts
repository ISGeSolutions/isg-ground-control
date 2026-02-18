/**
 * HttpApiClient — real HTTP implementation of IApiClient.
 * Calls Lovable Cloud backend functions with Supabase auth token.
 */

import { IApiClient, ApiResponse, ApiError, UserProfile } from './apiClient';
import { Departure, Activity, ActivityStatus } from '@/types/operations';
import { supabase } from '@/integrations/supabase/client';

export class HttpApiClient implements IApiClient {
  constructor(private _baseUrl?: string) {}

  private async invoke<T>(functionName: string, options?: {
    method?: string;
    body?: Record<string, unknown>;
    queryParams?: Record<string, string>;
  }): Promise<ApiResponse<T>> {
    // Build query string for GET-style params
    const url = options?.queryParams
      ? `${functionName}?${new URLSearchParams(options.queryParams).toString()}`
      : functionName;

    const { data, error } = await supabase.functions.invoke(url, {
      method: (options?.method || 'GET') as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
      body: options?.body,
    });

    if (error) {
      const apiError: ApiError = {
        error: 'FUNCTION_ERROR',
        message: error.message || 'Edge function error',
        status: 500,
      };
      throw apiError;
    }

    return data as ApiResponse<T>;
  }

  async getDepartures(filters?: Record<string, string>): Promise<ApiResponse<Departure[]>> {
    return this.invoke<Departure[]>('get-departures', { queryParams: filters });
  }

  async getDeparture(id: string): Promise<ApiResponse<Departure>> {
    return this.invoke<Departure>('get-departure', { queryParams: { id } });
  }

  async updateActivity(
    _departureId: string,
    activityId: string,
    patch: { status: ActivityStatus; notes?: string },
  ): Promise<ApiResponse<Activity>> {
    return this.invoke<Activity>('update-activity', {
      method: 'PATCH',
      body: { activityId, ...patch },
    });
  }

  async getMe(): Promise<ApiResponse<UserProfile>> {
    return this.invoke<UserProfile>('get-me');
  }
}
