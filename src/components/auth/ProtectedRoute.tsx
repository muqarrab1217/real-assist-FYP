import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'client' | 'admin';
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallbackPath = '/auth/login'
}) => {
  const location = useLocation();
  
  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  };

  // Check if user has the required role
  const hasRequiredRole = () => {
    if (!requiredRole) return true;
    const userRole = localStorage.getItem('role');
    return userRole === requiredRole;
  };

  // If not authenticated, redirect to login
  if (!isAuthenticated()) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // If authenticated but doesn't have required role, redirect to appropriate dashboard
  if (!hasRequiredRole()) {
    const userRole = localStorage.getItem('role');
    const redirectPath = userRole === 'admin' ? '/admin/dashboard' : '/client/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};
