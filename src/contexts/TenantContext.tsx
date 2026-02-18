import { createContext, useContext, useState, ReactNode } from 'react';
import { TenantConfig, resolveTenantFromUrl, buildTenantConfig } from '@/lib/tenantResolver';

interface TenantContextType {
  config: TenantConfig;
  isResolved: boolean;
}

const TenantContext = createContext<TenantContextType | null>(null);

export const useTenant = () => {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant must be used within TenantProvider');
  return ctx;
};

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const [state] = useState<TenantContextType>(() => {
    const resolved = resolveTenantFromUrl();
    const config = buildTenantConfig(resolved);
    return { config, isResolved: true };
  });

  return (
    <TenantContext.Provider value={state}>
      {children}
    </TenantContext.Provider>
  );
};
