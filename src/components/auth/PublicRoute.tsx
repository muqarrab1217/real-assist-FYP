import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectPath
}) => {
  const { isAuthenticated, role, loading } = useAuthContext();
  const location = useLocation();

  // Don't block rendering while auth initialises — public pages should appear instantly.
  // Once auth finishes and user turns out to be logged-in, redirect then.
  if (!loading && isAuthenticated) {
    const defaultRedirect = role === 'admin' ? '/admin/dashboard' : '/client/dashboard';
    const targetPath = redirectPath || defaultRedirect;

    const from = location.state?.from?.pathname || targetPath;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};
