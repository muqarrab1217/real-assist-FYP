import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectPath
}) => {
  const location = useLocation();
  
  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  };

  // If authenticated, redirect to appropriate dashboard
  if (isAuthenticated()) {
    const userRole = localStorage.getItem('role');
    const defaultRedirect = userRole === 'admin' ? '/admin/dashboard' : '/client/dashboard';
    const targetPath = redirectPath || defaultRedirect;
    
    // Get the intended destination from state, or use the default
    const from = location.state?.from?.pathname || targetPath;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};
