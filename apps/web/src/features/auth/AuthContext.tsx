/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { login as loginApi, me, register as registerApi } from './auth';
import { tokenStorage } from '../../lib/storage';
import type { User } from '../../types/models';

interface AuthContextValue {
  user: User | null;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = tokenStorage.get();
    if (!token) {
      setIsReady(true);
      return;
    }

    me()
      .then((u) => setUser(u))
      .catch(() => tokenStorage.clear())
      .finally(() => setIsReady(true));
  }, []);

  useEffect(() => {
    const handleExpiredSession = () => setUser(null);
    window.addEventListener('devboard:auth-expired', handleExpiredSession);
    return () => window.removeEventListener('devboard:auth-expired', handleExpiredSession);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isReady,
      login: async (email: string, password: string) => {
        const result = await loginApi({ email, password });
        tokenStorage.set(result.token);
        setUser(result.user);
      },
      register: async (name: string, email: string, password: string) => {
        const result = await registerApi({ name, email, password });
        tokenStorage.set(result.token);
        setUser(result.user);
      },
      logout: () => {
        tokenStorage.clear();
        setUser(null);
      },
    }),
    [user, isReady],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
