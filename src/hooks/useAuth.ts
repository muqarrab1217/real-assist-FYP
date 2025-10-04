import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'admin';
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  role: 'client' | 'admin' | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    role: null,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const role = localStorage.getItem('role') as 'client' | 'admin' | null;

    if (token && userStr && role) {
      try {
        const user = JSON.parse(userStr);
        setAuthState({
          isAuthenticated: true,
          user,
          token,
          role,
        });
      } catch (error) {
        // Invalid user data, clear storage
        clearAuth();
      }
    }
  }, []);

  // Login function (without navigation)
  const login = (user: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('role', user.role);
    
    setAuthState({
      isAuthenticated: true,
      user,
      token,
      role: user.role,
    });
  };

  // Logout function (without navigation)
  const logout = () => {
    clearAuth();
  };

  // Clear authentication data
  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      role: null,
    });
  };

  // Check if user has specific role
  const hasRole = (role: 'client' | 'admin') => {
    return authState.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles: ('client' | 'admin')[]) => {
    return authState.role ? roles.includes(authState.role) : false;
  };

  return {
    ...authState,
    login,
    logout,
    clearAuth,
    hasRole,
    hasAnyRole,
  };
};
