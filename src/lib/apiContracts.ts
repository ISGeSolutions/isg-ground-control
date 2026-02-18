/**
 * Central API Contracts map.
 * Each entry defines the endpoint, method, sample request, sample response, and error shapes.
 * Used by the ApiExpectationsPanel for developer reference.
 */

export interface ApiContract {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  sampleRequest?: Record<string, unknown> | null;
  sampleResponse: Record<string, unknown>;
  errorShapes: { status: number; body: Record<string, unknown> }[];
  /** Pages that use this contract */
  pages: string[];
}

export const API_CONTRACTS: ApiContract[] = [
  {
    id: 'get-departures',
    name: 'List Departures',
    method: 'GET',
    path: '/api/departures',
    description: 'Fetch paginated departures with filters',
    sampleRequest: null,
    sampleResponse: {
      data: [
        {
          id: 'dep-2026-03-01-AYT',
          date: '2026-03-01',
          destination: 'Antalya',
          destinationCode: 'AYT',
          series: 'SM24',
          paxCount: 42,
          activities: [{ templateCode: 'CQ', status: 'complete', dueDate: '2025-03-01' }],
        },
      ],
      meta: { total: 120, page: 1, pageSize: 50 },
    },
    errorShapes: [
      { status: 401, body: { error: 'UNAUTHORIZED', message: 'Session expired' } },
      { status: 403, body: { error: 'FORBIDDEN', message: 'Insufficient permissions' } },
    ],
    pages: ['/', '/operations'],
  },
  {
    id: 'get-departure-detail',
    name: 'Get Departure Detail',
    method: 'GET',
    path: '/api/departures/:id',
    description: 'Full departure with all activities',
    sampleRequest: null,
    sampleResponse: {
      id: 'dep-2026-03-01-AYT',
      date: '2026-03-01',
      destination: 'Antalya',
      activities: [],
      notes: '',
    },
    errorShapes: [
      { status: 404, body: { error: 'NOT_FOUND', message: 'Departure not found' } },
    ],
    pages: ['/'],
  },
  {
    id: 'patch-activity',
    name: 'Update Activity Status',
    method: 'PATCH',
    path: '/api/departures/:depId/activities/:actId',
    description: 'Update a single activity status, notes, etc.',
    sampleRequest: { status: 'complete', notes: 'Confirmed by agent' },
    sampleResponse: { id: 'act-1', status: 'complete', updatedAt: '2026-02-18T10:00:00Z' },
    errorShapes: [
      { status: 409, body: { error: 'CONFLICT', message: 'Activity was modified by another user' } },
      { status: 422, body: { error: 'VALIDATION', message: 'Invalid status transition' } },
    ],
    pages: ['/'],
  },
  {
    id: 'get-me',
    name: 'Get Current User',
    method: 'GET',
    path: '/auth/me',
    description: 'Returns authenticated user profile, theme, and localisation prefs',
    sampleRequest: null,
    sampleResponse: {
      id: 'usr-1',
      email: 'sarah@acme.com',
      displayName: 'Sarah Chen',
      roles: ['ops_manager'],
      locale: { language: 'en-GB', currency: 'GBP', timezone: 'Europe/London' },
      theme: { palette: 'ocean', mode: 'dark' },
    },
    errorShapes: [
      { status: 401, body: { error: 'UNAUTHORIZED', message: 'No active session' } },
    ],
    pages: ['*'],
  },
  {
    id: 'post-auth-session',
    name: 'Create Session',
    method: 'POST',
    path: '/auth/session',
    description: 'Exchange OIDC authorization code for backend session (httpOnly cookie)',
    sampleRequest: { code: 'abc123', code_verifier: 'xyz789', redirect_uri: 'https://...' },
    sampleResponse: { ok: true, expiresIn: 3600 },
    errorShapes: [
      { status: 400, body: { error: 'INVALID_CODE', message: 'Authorization code invalid or expired' } },
    ],
    pages: ['/auth/callback'],
  },
  {
    id: 'post-auth-refresh',
    name: 'Refresh Session',
    method: 'POST',
    path: '/auth/refresh',
    description: 'Rotate refresh token and extend session',
    sampleRequest: null,
    sampleResponse: { ok: true, expiresIn: 3600 },
    errorShapes: [
      { status: 401, body: { error: 'SESSION_EXPIRED', message: 'Refresh token expired' } },
    ],
    pages: ['*'],
  },
  {
    id: 'post-auth-logout',
    name: 'Logout',
    method: 'POST',
    path: '/auth/logout',
    description: 'Destroy backend session and clear cookies',
    sampleRequest: null,
    sampleResponse: { ok: true },
    errorShapes: [],
    pages: ['*'],
  },
  {
    id: 'post-telemetry',
    name: 'Submit Telemetry',
    method: 'POST',
    path: '/telemetry/events',
    description: 'Batch analytics + error events with PII redaction',
    sampleRequest: {
      events: [
        { type: 'page_view', page: '/', timestamp: '2026-02-18T10:00:00Z', meta: {} },
        { type: 'error', message: 'TypeError: x is not a function', stack: '...', severity: 'error' },
      ],
    },
    sampleResponse: { accepted: 2 },
    errorShapes: [
      { status: 429, body: { error: 'RATE_LIMITED', retryAfter: 60 } },
    ],
    pages: ['*'],
  },
  {
    id: 'post-support-request',
    name: 'Submit Support Request',
    method: 'POST',
    path: '/support/request',
    description: 'Submit help message with optional screenshot attachment',
    sampleRequest: { message: 'I cannot see my departure...', screenshotBase64: '...' },
    sampleResponse: { ticketId: 'SUP-12345', status: 'created' },
    errorShapes: [
      { status: 413, body: { error: 'PAYLOAD_TOO_LARGE', message: 'Screenshot exceeds 5MB' } },
    ],
    pages: ['*'],
  },
];

/** Get contracts relevant to a specific page path */
export function getContractsForPage(path: string): ApiContract[] {
  return API_CONTRACTS.filter(c => c.pages.includes('*') || c.pages.includes(path));
}
