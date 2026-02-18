import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { startLogin, logout as doLogout, startRefreshTimer, stopRefreshTimer } from '@/lib/authService';
import { UserProfile } from '@/lib/apiClient';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (u: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { config } = useTenant();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async () => {
    await startLogin(config);
  }, [config]);

  const logout = useCallback(async () => {
    stopRefreshTimer();
    await doLogout(config.apiBaseUrl);
    setUser(null);
  }, [config.apiBaseUrl]);

  // Start refresh timer when user is authenticated
  useEffect(() => {
    if (user) {
      startRefreshTimer(config.apiBaseUrl);
      return () => stopRefreshTimer();
    }
  }, [user, config.apiBaseUrl]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
