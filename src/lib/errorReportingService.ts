/**
 * ErrorReportingService — captures unhandled errors and promise rejections,
 * redacts PII, and sends to backend telemetry endpoint.
 */

import { redactPII } from './telemetryRedaction';

interface ErrorEvent {
  type: 'error';
  message: string;
  stack?: string;
  severity: 'error' | 'warning';
  page: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

const ERROR_QUEUE: ErrorEvent[] = [];
let _baseUrl = '';
let _enabled = false;

export function initErrorReporting(baseUrl: string, enabled: boolean) {
  _baseUrl = baseUrl;
  _enabled = enabled;

  if (!_enabled) return;

  window.addEventListener('error', (e) => {
    captureError(e.message, e.error?.stack, 'error');
  });

  window.addEventListener('unhandledrejection', (e) => {
    const msg = e.reason?.message || String(e.reason);
    captureError(msg, e.reason?.stack, 'error');
  });
}

export function captureError(
  message: string,
  stack?: string,
  severity: 'error' | 'warning' = 'error',
  meta?: Record<string, unknown>,
) {
  if (!_enabled) return;
  ERROR_QUEUE.push({
    type: 'error',
    message: redactString(message),
    stack: stack ? redactString(stack) : undefined,
    severity,
    page: window.location.pathname,
    timestamp: new Date().toISOString(),
    meta: meta ? redactPII(meta) : undefined,
  });
  // Flush errors immediately (they're important)
  flushErrors();
}

function redactString(s: string): string {
  // Redact emails
  return s.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]');
}

async function flushErrors() {
  if (ERROR_QUEUE.length === 0) return;
  const batch = ERROR_QUEUE.splice(0, ERROR_QUEUE.length);
  try {
    // TODO: Replace with actual telemetry endpoint
    await fetch(`${_baseUrl}/telemetry/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ events: batch }),
    });
  } catch {
    // Best effort — don't re-queue errors to avoid loops
  }
}
