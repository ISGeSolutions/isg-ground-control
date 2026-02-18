import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { IApiClient, ApiMode, getApiMode, setApiMode as persistApiMode } from '@/lib/apiClient';
import { MockApiClient } from '@/lib/mockApiClient';
import { HttpApiClient } from '@/lib/httpApiClient';
import { useTenant } from '@/contexts/TenantContext';

interface ApiClientContextType {
  client: IApiClient;
  mode: ApiMode;
  setMode: (m: ApiMode) => void;
  /** Whether the current user is allowed to toggle to live */
  canToggleLive: boolean;
}

const ApiClientContext = createContext<ApiClientContextType | null>(null);

export const useApiClient = () => {
  const ctx = useContext(ApiClientContext);
  if (!ctx) throw new Error('useApiClient must be used within ApiClientProvider');
  return ctx;
};

const mockClient = new MockApiClient();

export const ApiClientProvider = ({ children, isAdmin = false }: { children: ReactNode; isAdmin?: boolean }) => {
  const { config } = useTenant();
  const [mode, setModeState] = useState<ApiMode>(() => getApiMode(config.tenantId));

  const setMode = useCallback((m: ApiMode) => {
    setModeState(m);
    persistApiMode(config.tenantId, m);
  }, [config.tenantId]);

  const client = useMemo<IApiClient>(() => {
    if (mode === 'live') return new HttpApiClient(config.apiBaseUrl);
    return mockClient;
  }, [mode, config.apiBaseUrl]);

  const canToggleLive = isAdmin && config.features.liveApiToggle;

  return (
    <ApiClientContext.Provider value={{ client, mode, setMode, canToggleLive }}>
      {children}
    </ApiClientContext.Provider>
  );
};
