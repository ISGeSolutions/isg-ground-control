/**
 * PII redaction utilities for telemetry data.
 * Strips emails, phone numbers, and sensitive field values.
 */

const SENSITIVE_KEYS = new Set([
  'email', 'phone', 'password', 'token', 'secret', 'authorization',
  'credit_card', 'ssn', 'passport', 'address', 'dob', 'date_of_birth',
]);

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE = /(\+?\d{1,4}[\s-]?)?\(?\d{2,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}/g;

export function redactPII(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      result[key] = '[REDACTED]';
    } else if (typeof value === 'string') {
      result[key] = value.replace(EMAIL_RE, '[EMAIL]').replace(PHONE_RE, '[PHONE]');
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = redactPII(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}
