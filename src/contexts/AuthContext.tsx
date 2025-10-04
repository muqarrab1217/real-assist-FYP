import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  token: string | null;
  role: 'client' | 'admin' | null;
  login: (user: any, token: string) => void;
  logout: () => void;
  clearAuth: () => void;
  hasRole: (role: 'client' | 'admin') => boolean;
  hasAnyRole: (roles: ('client' | 'admin')[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
