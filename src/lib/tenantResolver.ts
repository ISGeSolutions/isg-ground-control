/**
 * TenantResolver — extracts tenant + environment from subdomain.
 * Expected format: {tenant}-{env}.app.example.com
 * Fallback: query param ?tenant=xxx&env=yyy for local dev.
 */

export interface TenantConfig {
  tenantId: string;
  environment: 'dev' | 'staging' | 'prod';
  displayName: string;
  oidc: {
    authority: string;
    clientId: string;
    redirectUri: string;
    scope: string;
  };
  apiBaseUrl: string;
  features: {
    helpWidget: boolean;
    analytics: boolean;
    errorReporting: boolean;
    liveApiToggle: boolean;
  };
  branding: {
    primaryColor?: string;
    logoUrl?: string;
  };
}

// TODO: In production, fetch from /api/tenants/{tenantId}/config
// For now, a static registry for development.
const TENANT_REGISTRY: Record<string, Partial<TenantConfig>> = {
  novadhruv: {
    displayName: 'novadhruv-dev.eisg.com',
    oidc: {
      authority: 'https://auth.acme.example.com',
      clientId: 'ops-admin-acme',
      redirectUri: '', // resolved at runtime
      scope: 'openid profile email',
    },
    apiBaseUrl: 'https://api.acme.example.com',
    features: { helpWidget: true, analytics: true, errorReporting: true, liveApiToggle: true },
    branding: { primaryColor: '#1e40af' },
  },
  globetrotter: {
    displayName: 'Globetrotter Holidays',
    oidc: {
      authority: 'https://auth.globetrotter.example.com',
      clientId: 'ops-admin-gt',
      redirectUri: '',
      scope: 'openid profile email',
    },
    apiBaseUrl: 'https://api.globetrotter.example.com',
    features: { helpWidget: true, analytics: true, errorReporting: true, liveApiToggle: false },
    branding: { primaryColor: '#059669' },
  },
};

type Environment = TenantConfig['environment'];

function parseEnvironment(raw: string): Environment {
  if (['dev', 'staging', 'prod'].includes(raw)) return raw as Environment;
  return 'dev';
}

export interface ResolvedTenant {
  tenantId: string;
  environment: Environment;
}

/**
 * Extract tenant + env from window.location.
 * Format: {tenant}-{env}.app.example.com
 * Fallback: ?tenant=xxx&env=yyy
 */
export function resolveTenantFromUrl(): ResolvedTenant {
  const params = new URLSearchParams(window.location.search);
  const paramTenant = params.get('tenant');
  const paramEnv = params.get('env');

  if (paramTenant) {
    return {
      tenantId: paramTenant,
      environment: parseEnvironment(paramEnv || 'dev'),
    };
  }

  const hostname = window.location.hostname;
  // Match: acme-prod.app.example.com
  const match = hostname.match(/^([a-z0-9]+)-([a-z]+)\./i);
  if (match) {
    return {
      tenantId: match[1].toLowerCase(),
      environment: parseEnvironment(match[2].toLowerCase()),
    };
  }

  // Default for localhost / preview
  return { tenantId: 'novadhruv', environment: 'dev' };
}

export function buildTenantConfig(resolved: ResolvedTenant): TenantConfig {
  const base = TENANT_REGISTRY[resolved.tenantId];
  const origin = window.location.origin;

  return {
    tenantId: resolved.tenantId,
    environment: resolved.environment,
    displayName: base?.displayName ?? resolved.tenantId,
    oidc: {
      authority: base?.oidc?.authority ?? '',
      clientId: base?.oidc?.clientId ?? '',
      redirectUri: `${origin}/auth/callback`,
      scope: base?.oidc?.scope ?? 'openid profile email',
    },
    apiBaseUrl: base?.apiBaseUrl ?? `${origin}/api`,
    features: {
      helpWidget: base?.features?.helpWidget ?? false,
      analytics: base?.features?.analytics ?? false,
      errorReporting: base?.features?.errorReporting ?? false,
      liveApiToggle: base?.features?.liveApiToggle ?? false,
    },
    branding: base?.branding ?? {},
  };
}
