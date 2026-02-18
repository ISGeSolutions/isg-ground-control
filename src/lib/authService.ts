/**
 * OIDC Auth Code + PKCE service.
 *
 * Flow:
 * 1. Generate code_verifier + code_challenge (S256)
 * 2. Redirect to OIDC provider authorize endpoint
 * 3. On callback, exchange code via POST /auth/session (backend)
 * 4. Backend sets httpOnly cookie — NO tokens in localStorage
 * 5. Refresh via POST /auth/refresh (rotating refresh tokens)
 * 6. Logout via POST /auth/logout
 */

import { TenantConfig } from './tenantResolver';

// ─── PKCE helpers ────────────────────────────────────────────────────────────

function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('').slice(0, length);
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  return crypto.subtle.digest('SHA-256', encoder.encode(plain));
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach(b => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// ─── Session storage for PKCE state (survives redirect) ─────────────────────
const PKCE_KEY = 'ops-pkce-verifier';
const STATE_KEY = 'ops-auth-state';

// ─── Public API ──────────────────────────────────────────────────────────────

export async function startLogin(config: TenantConfig) {
  const codeVerifier = generateRandomString(64);
  const challengeBuffer = await sha256(codeVerifier);
  const codeChallenge = base64UrlEncode(challengeBuffer);
  const state = generateRandomString(32);

  // Store in sessionStorage (survives redirect, cleared on tab close)
  sessionStorage.setItem(PKCE_KEY, codeVerifier);
  sessionStorage.setItem(STATE_KEY, state);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.oidc.clientId,
    redirect_uri: config.oidc.redirectUri,
    scope: config.oidc.scope,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
  });

  window.location.href = `${config.oidc.authority}/authorize?${params}`;
}

export async function handleCallback(apiBaseUrl: string): Promise<{ ok: boolean; error?: string }> {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const returnedState = params.get('state');
  const savedState = sessionStorage.getItem(STATE_KEY);
  const codeVerifier = sessionStorage.getItem(PKCE_KEY);

  // Cleanup
  sessionStorage.removeItem(PKCE_KEY);
  sessionStorage.removeItem(STATE_KEY);

  if (!code || !codeVerifier) {
    return { ok: false, error: 'Missing authorization code or PKCE verifier' };
  }

  if (returnedState !== savedState) {
    return { ok: false, error: 'State mismatch — possible CSRF' };
  }

  // TODO: POST to backend /auth/session endpoint
  try {
    const res = await fetch(`${apiBaseUrl}/auth/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        code,
        code_verifier: codeVerifier,
        redirect_uri: window.location.origin + '/auth/callback',
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: 'Session exchange failed' }));
      return { ok: false, error: body.message };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, error: 'Network error during session exchange' };
  }
}

export async function refreshSession(apiBaseUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${apiBaseUrl}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function logout(apiBaseUrl: string): Promise<void> {
  try {
    await fetch(`${apiBaseUrl}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // Best effort
  }
}

// ─── Refresh timer ───────────────────────────────────────────────────────────
let refreshTimer: ReturnType<typeof setInterval> | null = null;

export function startRefreshTimer(apiBaseUrl: string, intervalMs = 4 * 60 * 1000) {
  stopRefreshTimer();
  refreshTimer = setInterval(async () => {
    const ok = await refreshSession(apiBaseUrl);
    if (!ok) {
      stopRefreshTimer();
      // Session expired — redirect to login
      window.location.href = '/';
    }
  }, intervalMs);
}

export function stopRefreshTimer() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}
