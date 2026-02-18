/**
 * AnalyticsService — batches page_view / interaction events and sends to
 * backend telemetry endpoint. Includes PII redaction.
 */

import { redactPII } from './telemetryRedaction';

export interface AnalyticsEvent {
  type: 'page_view' | 'interaction' | 'feature_used';
  page: string;
  action?: string;
  meta?: Record<string, unknown>;
  timestamp: string;
}

const QUEUE: AnalyticsEvent[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;

let _baseUrl = '';
let _enabled = false;

export function initAnalytics(baseUrl: string, enabled: boolean) {
  _baseUrl = baseUrl;
  _enabled = enabled;
  if (_enabled && !flushTimer) {
    flushTimer = setInterval(flush, 10_000);
  }
}

export function trackPageView(page: string) {
  if (!_enabled) return;
  QUEUE.push({ type: 'page_view', page, timestamp: new Date().toISOString() });
}

export function trackInteraction(page: string, action: string, meta?: Record<string, unknown>) {
  if (!_enabled) return;
  QUEUE.push({ type: 'interaction', page, action, meta: meta ? redactPII(meta) : undefined, timestamp: new Date().toISOString() });
}

async function flush() {
  if (QUEUE.length === 0) return;
  const batch = QUEUE.splice(0, QUEUE.length);
  try {
    // TODO: Replace with actual telemetry endpoint
    await fetch(`${_baseUrl}/telemetry/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ events: batch }),
    });
  } catch {
    // Re-queue on failure (up to a max)
    if (QUEUE.length < 500) QUEUE.push(...batch);
  }
}

export function destroyAnalytics() {
  if (flushTimer) clearInterval(flushTimer);
  flushTimer = null;
  flush(); // final flush
}
