import React from 'react';
import { Navigate } from 'react-router-dom';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: ('client' | 'admin')[];
  fallbackPath?: string;
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  allowedRoles,
  fallbackPath = '/auth/login'
}) => {
  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  };

  // Get user role
  const getUserRole = () => {
    return localStorage.getItem('role') as 'client' | 'admin' | null;
  };

  // If not authenticated, redirect to login
  if (!isAuthenticated()) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Get user role
  const userRole = getUserRole();

  // If user role is not in allowed roles, redirect to appropriate dashboard
  if (!userRole || !allowedRoles.includes(userRole)) {
    const redirectPath = userRole === 'admin' ? '/admin/dashboard' : '/client/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};
