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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    const defaultRedirect = role === 'admin' ? '/admin/dashboard' : '/client/dashboard';
    const targetPath = redirectPath || defaultRedirect;

    const from = location.state?.from?.pathname || targetPath;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};
