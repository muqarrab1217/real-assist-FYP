import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'client' | 'admin' | 'employee' | 'sales_rep';
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallbackPath = '/auth/login'
}) => {
  const { isAuthenticated, user, role, loading, profileReady } = useAuthContext();
  const location = useLocation();

  // Initial auth check still running
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    const redirectPath = role === 'admin' ? '/admin/dashboard' : (role === 'employee' ? '/employee/dashboard' : (role === 'sales_rep' ? '/sales-rep/dashboard' : '/client/dashboard'));
    return <Navigate to={redirectPath} replace />;
  }

  // Profile completion gate: employee/sales_rep must complete their profile first.
  // Only enforce AFTER profileReady (DB data loaded), not while still fetching.
  const isSettingsPage = location.pathname.includes('/settings');
  if ((role === 'employee' || role === 'sales_rep') && profileReady && !user?.profileCompleted && !isSettingsPage) {
    const settingsPath = role === 'employee' ? '/employee/settings' : '/sales-rep/settings';
    return <Navigate to={settingsPath} replace />;
  }

  // Profile is loading in the background — render children immediately.
  // The page will re-render with full profile data once the fetch completes.
  return <>{children}</>;
};
