// Authentication utility functions

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'admin';
}

export const getStoredToken = (): string | null => {
  return localStorage.getItem('token');
};

export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const getStoredRole = (): 'client' | 'admin' | null => {
  return localStorage.getItem('role') as 'client' | 'admin' | null;
};

export const isAuthenticated = (): boolean => {
  const token = getStoredToken();
  const user = getStoredUser();
  return !!(token && user);
};

export const hasRole = (role: 'client' | 'admin'): boolean => {
  const userRole = getStoredRole();
  return userRole === role;
};

export const hasAnyRole = (roles: ('client' | 'admin')[]): boolean => {
  const userRole = getStoredRole();
  return userRole ? roles.includes(userRole) : false;
};

export const clearAuthData = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('role');
};

export const setAuthData = (user: User, token: string): void => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('role', user.role);
};
