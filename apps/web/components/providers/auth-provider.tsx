'use client';

import { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useCurrentUser } from '@/lib/queries/auth';

const AuthContext = createContext<{}>({});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, setUser } = useAuthStore();
  const { data: user, isError } = useCurrentUser();

  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);

  useEffect(() => {
    if (isError && isAuthenticated) {
      // Token expired or invalid
      useAuthStore.getState().clearAuth();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
    }
  }, [isError, isAuthenticated]);

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
